# Admin Image Storage Reorganization - Design Document

## Problem Statement

The current admin image upload system has several critical issues that lead to storage inefficiency and poor organization:

1. **Storage Pollution**: When admin users upload images during entity creation but then cancel the modal, uploaded images remain as orphaned files in storage buckets
2. **Poor Organization**: Images are stored without proper folder structure based on entity relationships
3. **Missing Infrastructure**: Authors need banner images but no dedicated storage bucket exists
4. **Cleanup Complexity**: No systematic approach to clean up temporary uploads when operations are cancelled
5. **Resource Waste**: Accumulation of unused images leads to unnecessary storage costs and clutter

The current system uploads images directly to their final locations during the creation process, making cleanup difficult when users abandon the creation workflow.

## Requirements

### Functional Requirements
- All admin create modals must generate a temporary UUID on load for organizing uploads
- Images must be stored in organized subfolders: `{bucket}/{entity-id}/{files}`
- Temporary uploads during creation flow must use: `{bucket}/temp/{session-uuid}/{files}`
- Successfully created entities must move images from temp to permanent folders
- Cancelled operations must trigger cleanup of all temporary files
- Authors must support both avatar and banner image uploads
- System must handle multiple image types per entity (featured images, content images, etc.)

### Non-Functional Requirements
- **Performance**: Image operations should not significantly impact modal load times
- **Reliability**: Cleanup operations must be robust and handle partial failures
- **Maintainability**: Clear separation between temporary and permanent storage
- **Scalability**: Support for future entity types and additional image requirements
- **Storage Efficiency**: Minimize orphaned files and optimize storage usage

## Current State Analysis

### Existing Storage Buckets
```typescript
export const STORAGE_BUCKETS = {
  ARTICLE_IMAGES: 'article-images',      // ✅ Exists
  AUTHOR_AVATARS: 'author-avatars',      // ✅ Exists  
  AUTHOR_BANNERS: 'author-banners',      // ✅ Exists (confirmed in code)
  FEATURED_IMAGES: 'featured-images',    // ✅ Exists
  BRIEF_IMAGES: 'brief-images',          // ✅ Exists
  COMPANY_LOGOS: 'company-logos',        // ✅ Exists
  BULL_ROOM_FILES: 'bull-room-files'     // ✅ Exists
}
```

### Current Upload Flow Issues
1. **ArticleCreateModal**: Uses `uploadTemporaryFeaturedImage()` with `temp/{sessionId}/` pattern ✅
2. **BriefCreateModal**: Uses `uploadTemporaryFeaturedImage()` with `temp/{sessionId}/` pattern ✅
3. **AuthorManager**: Uses generic CreateModal with no temporary upload system ❌
4. **Generic CreateModal**: Has upload session tracking but inconsistent implementation ❌

### Upload Session System
- `useUploadSession()` hook provides session management ✅
- Tracks uploaded files for cleanup ✅
- `cleanupSession()` and `commitSession()` methods exist ✅
- Not consistently used across all modals ❌

## Proposed Architecture

### 1. Direct Upload System (No File Moving)

```typescript
interface EntityUploadConfig {
  entityType: 'article' | 'author' | 'brief' | 'company';
  buckets: {
    primary?: string;     // Main image (featured/avatar)
    secondary?: string;   // Additional images (banner/content)
  };
  folderStructure: string; // e.g., '{entityType}s/{entityId}'
}

const ENTITY_UPLOAD_CONFIGS: Record<string, EntityUploadConfig> = {
  article: {
    entityType: 'article',
    buckets: {
      primary: STORAGE_BUCKETS.FEATURED_IMAGES,
      secondary: STORAGE_BUCKETS.ARTICLE_IMAGES
    },
    folderStructure: 'articles/{entityId}'
  },
  author: {
    entityType: 'author', 
    buckets: {
      primary: STORAGE_BUCKETS.AUTHOR_AVATARS,
      secondary: STORAGE_BUCKETS.AUTHOR_BANNERS
    },
    folderStructure: 'authors/{entityId}'
  },
  brief: {
    entityType: 'brief',
    buckets: {
      primary: STORAGE_BUCKETS.FEATURED_IMAGES,
      secondary: STORAGE_BUCKETS.BRIEF_IMAGES  
    },
    folderStructure: 'briefs/{entityId}'
  }
};
```

### 2. Direct Upload Session Management

```typescript
interface EntityUploadSession {
  entityId: string;          // Pre-generated UUID for creates, existing ID for edits
  entityType: string;
  modalType: 'create' | 'edit';
  uploadedFiles: Array<{
    bucket: string;
    finalPath: string;       // Direct upload path, no moving needed
    fileType: 'primary' | 'secondary';
    originalName: string;
    url: string;
  }>;
  createdAt: Date;
}

export function useEntityUploadSession(
  entityType: string, 
  modalType: 'create' | 'edit',
  existingEntityId?: string
) {
  const [session, setSession] = useState<EntityUploadSession | null>(null);
  
  // Initialize session
  const initializeSession = () => {
    const entityId = modalType === 'create' ? uuidv4() : existingEntityId!;
    setSession({
      entityId,
      entityType,
      modalType,
      uploadedFiles: [],
      createdAt: new Date()
    });
    return entityId;
  };
  
  // Upload directly to final organized location
  const uploadDirect = async (
    file: File, 
    fileType: 'primary' | 'secondary'
  ) => {
    const config = ENTITY_UPLOAD_CONFIGS[entityType];
    const bucket = fileType === 'primary' ? config.buckets.primary : config.buckets.secondary;
    const folderPath = config.folderStructure.replace('{entityId}', session!.entityId);
    const finalPath = `${folderPath}/${generateFileName(file.name)}`;
    
    // Upload directly to final location
    const result = await uploadImage(file, bucket!, finalPath);
    
    // Track upload
    setSession(prev => prev ? {
      ...prev,
      uploadedFiles: [...prev.uploadedFiles, {
        bucket: bucket!,
        finalPath,
        fileType,
        originalName: file.name,
        url: result.url
      }]
    } : null);
    
    return result;
  };
  
  // Create entity with pre-generated ID (no file operations needed)
  const commitCreate = async () => {
    // Files already in final location
    // Just need to create entity record with session.entityId
  };
  
  // Enterprise-safe approach: No immediate cleanup on cancellation
  const cleanup = async () => {
    // Do nothing immediately - files remain in organized folders
    // Conservative scheduled cleanup job will handle orphaned files
    // after safe aging period (7+ days) with proper validation
  };
}
```

### 3. Folder Structure Organization

#### Current Structure (Problematic)
```
featured-images/
├── temp/
│   ├── session-1-uuid/
│   │   └── featured-123.jpg  ✅ Good temporary structure
│   └── session-2-uuid/
│       └── featured-456.jpg
├── article-uuid-1/          ❌ Articles use UUIDs directly  
│   └── featured-789.jpg
└── loose-files.jpg           ❌ Orphaned files
```

#### Proposed Structure (Direct Upload to Final Location)
```
featured-images/
├── articles/
│   ├── article-uuid-1/      ✅ CREATE: Pre-generated UUID, direct upload
│   │   └── featured-789.jpg ✅ EDIT: Existing ID, direct upload
│   └── article-uuid-2/
│       └── featured-012.jpg
└── briefs/
    ├── brief-uuid-1/        ✅ Direct upload to final organized location
    │   └── featured-345.jpg
    └── brief-uuid-2/
        └── featured-678.jpg

author-avatars/
└── authors/
    ├── author-uuid-1/       ✅ CREATE: Upload to pre-generated UUID folder
    │   └── avatar-234.jpg   ✅ EDIT: Upload to existing entity folder
    └── author-uuid-2/
        └── avatar-567.jpg

author-banners/              ✅ Author banner support
└── authors/
    ├── author-uuid-1/       ✅ Same entity folder for related images
    │   └── banner-123.jpg
    └── author-uuid-2/
        └── banner-456.jpg

article-images/              ✅ Additional article content images
└── articles/
    ├── article-uuid-1/
    │   ├── content-img-1.jpg
    │   └── content-img-2.jpg
    └── article-uuid-2/
        └── content-img-3.jpg

brief-images/                ✅ Additional brief content images  
└── briefs/
    ├── brief-uuid-1/
    │   └── content-img-4.jpg
    └── brief-uuid-2/
        └── content-img-5.jpg
```

**Key Principles:**
- **CREATE Modals**: Generate UUID → Upload directly to `{entityType}s/{uuid}/` → Create entity with that UUID
- **EDIT Modals**: Use existing ID → Upload directly to `{entityType}s/{existingId}/` → Update entity
- **Cancellation**: CREATE/EDIT = Do nothing immediately (enterprise-safe approach)
- **Cleanup**: Conservative scheduled job removes orphaned files after safe aging period
- **No temp folders or file moving needed!**

### 4. Direct Upload Storage Service

```typescript
export class EntityImageStorageService {
  
  static async uploadDirectToEntity(
    file: File,
    entityType: string,
    entityId: string,
    bucketName: string,
    fileType: 'primary' | 'secondary'
  ): Promise<{ url: string; path: string }> {
    const fileName = this.generateFileName(file.name, fileType);
    const finalPath = `${entityType}s/${entityId}/${fileName}`;
    
    // Upload directly to final organized location
    const result = await uploadImage(file, bucketName, finalPath);
    
    return {
      ...result,
      path: finalPath
    };
  }
  
  static async cleanupOrphanedFiles(
    entityType: string,
    maxAgeHours: number = 168 // 7 days default
  ): Promise<void> {
    // Enterprise-safe scheduled cleanup for orphaned entity folders
    // Only removes folders that:
    // 1. Are older than maxAgeHours
    // 2. Have no corresponding entity in database
    // 3. Pass additional safety checks
    
    // This method would be called by a scheduled job, not directly by modals
    // Implementation would query database to verify entity existence
    // before removing any files
    
    console.log(`Scheduled cleanup for orphaned ${entityType} files older than ${maxAgeHours} hours`);
    // Implementation details would go here when scheduled cleanup system is built
    // Would require:
    // - Database queries to check entity existence
    // - File age verification  
    // - Audit logging
    // - Safe batch processing
  }
  
  static async deleteSpecificImage(
    bucketName: string,
    imagePath: string
  ): Promise<void> {
    // For individual image deletion in edit flows
    try {
      await supabase.storage
        .from(bucketName)
        .remove([imagePath]);
    } catch (error) {
      console.error(`Failed to delete image ${imagePath} from ${bucketName}:`, error);
    }
  }
  
  static generateEntityPath(
    entityType: string,
    entityId: string,
    fileName: string
  ): string {
    return `${entityType}s/${entityId}/${fileName}`;
  }
}
```

## Implementation Plan

### Phase 1: Core Infrastructure (Priority: Critical)
1. **Create enhanced upload session hook**
   - Implement `useEntityUploadSession()` with entity-specific configuration
   - Add support for multiple file types per session
   - Integrate automatic cleanup on session end

2. **Update storage service functions**
   - Enhance `EntityImageStorageService` with move operations
   - Add batch cleanup functionality for sessions
   - Implement organized folder structure logic

3. **Test with existing ArticleCreateModal**
   - Verify temporary upload flow works correctly
   - Test session cleanup on cancellation
   - Validate move to permanent location on creation

### Phase 2: Modal Integration (Priority: High)
1. **Update ArticleCreateModal**
   - Integrate new upload session system
   - Test featured image and article image workflows
   - Ensure proper cleanup on cancellation

2. **Update BriefCreateModal**
   - Similar integration for brief creation workflow
   - Handle featured images and brief-specific images

3. **Enhance AuthorManager/CreateModal**
   - Add support for both avatar and banner uploads
   - Implement temporary upload workflow
   - Test author creation with multiple image types

### Phase 3: Generic Modal Enhancement (Priority: Medium)
1. **Update generic CreateModal component**
   - Add entity-type awareness for upload configuration
   - Implement unified image upload interface
   - Support dynamic bucket and folder configuration

2. **Update EditModal component**
   - Handle image updates with temporary uploads
   - Implement image replacement workflows
   - Maintain backward compatibility

### Phase 4: Enterprise Cleanup Strategy (Future Enhancement)
1. **Conservative scheduled cleanup job**
   - Daily/weekly job to identify truly orphaned entity folders
   - Only remove folders older than 7+ days with no corresponding database entity
   - Comprehensive audit logging of all cleanup operations
   - Safe batch processing with rollback capabilities

2. **Monitoring and maintenance**
   - Monitor storage growth patterns
   - Track new organized uploads vs legacy structure
   - Alert on unusual storage growth or cleanup failures
   - Dashboard for orphaned file statistics

## Implementation Strategy

### Step 1: Implement New Upload System (No Migration Required)
- Deploy enhanced upload session hooks
- Update storage service with new organization logic
- Ensure full backward compatibility with existing URLs
- New uploads use organized structure, existing images stay untouched

### Step 2: Test with New Entities
- Create test entities using new organized upload system
- Verify cleanup functionality works correctly
- Test edge cases (network failures, partial uploads)
- Confirm existing images continue to work normally

### Step 3: Deploy and Monitor
- Deploy new system to production
- Monitor new organized uploads
- Track cleanup success rates
- Existing images remain functional throughout

## Testing Strategy

### Unit Tests
```typescript
describe('EntityImageStorageService', () => {
  test('uploads to correct temporary folder structure');
  test('moves images to organized permanent folders');
  test('cleans up session files correctly');
  test('handles partial failures gracefully');
});

describe('useEntityUploadSession', () => {
  test('initializes session with correct entity type');
  test('tracks multiple uploads in session');
  test('commits all uploads to entity folder');
  test('cleans up on cancellation');
});
```

### Integration Tests
1. **Complete Article Creation Flow**
   - Upload featured image and article images
   - Complete creation - verify images moved to `articles/{id}/`
   - Cancel creation - verify temp folder cleaned up

2. **Author Management Flow**
   - Upload avatar and banner images
   - Test both create and edit workflows
   - Verify images organized in `authors/{id}/`

3. **Brief Creation Flow**
   - Upload featured and brief-specific images
   - Test complete workflow with cleanup

### Manual Testing Scenarios
1. **Network Interruption**: Interrupt upload during file transfer
2. **Large File Uploads**: Test with various file sizes and types
3. **Rapid Modal Open/Close**: Test cleanup when modals are quickly opened and closed
4. **Multiple Concurrent Sessions**: Test with multiple admin users uploading simultaneously

## Risk Assessment

### High Risk
- **Broken image URLs in production**: Mitigated by full backward compatibility and no migration required

### Medium Risk  
- **Performance impact on modal load**: Mitigated by async UUID generation
- **Cleanup failures leaving orphaned files**: Mitigated by robust error handling

### Low Risk
- **Edge cases in concurrent uploads**: Mitigated by session isolation
- **Storage bucket permission issues**: Mitigated by testing in staging

## Success Metrics

### Technical Metrics
- **Orphaned File Reduction**: <1% of uploaded images should be orphaned
- **Storage Organization**: 100% of new uploads use organized folder structure
- **Cleanup Success Rate**: >99% successful cleanup of cancelled sessions
- **Upload Performance**: Modal load times remain under 2 seconds

### User Experience Metrics
- **Admin Workflow Efficiency**: No regression in creation modal usability
- **Error Rate**: <0.1% upload failures in production
- **Support Requests**: Significant reduction in storage-related issues

## Future Enhancements

### Advanced Features
1. **Image Optimization Pipeline**: Automatic resizing and format optimization
2. **CDN Integration**: Serve images through optimized CDN
3. **Bulk Operations**: Admin tools for managing multiple images
4. **Analytics**: Storage usage analytics and optimization recommendations

### Monitoring and Alerting
1. **Storage Growth Monitoring**: Track storage usage trends
2. **Orphaned File Detection**: Regular scans for cleanup opportunities
3. **Performance Monitoring**: Track upload and cleanup performance
4. **Error Alerting**: Real-time alerts for storage operation failures

## Conclusion

This comprehensive reorganization will transform the admin image storage system from a chaotic, inefficient mess into a well-organized, enterprise-grade system that:

1. **Eliminates data loss risk** through conservative enterprise-safe cleanup approach
2. **Improves organization** with entity-type-based folder structures  
3. **Enhances maintainability** through consistent upload patterns and audit trails
4. **Provides scalability** for future entity types and image requirements
5. **Ensures reliability** with scheduled cleanup and comprehensive monitoring
6. **Follows enterprise best practices** with safety margins and recovery capabilities

The implementation follows best practices for file management, provides robust error handling, and maintains backward compatibility while setting up the foundation for future enhancements.

import { useState, useEffect } from 'react';
import { promptService, promptCategoryService, promptFieldService, Prompt, PromptCategory, PromptField } from '../services/database';

export const usePrompts = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<PromptCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [promptsData, categoriesData] = await Promise.all([
          promptService.getAll(),
          promptCategoryService.getAll()
        ]);
        
        // Load fields for each prompt
        const promptsWithFields = await Promise.all(
          promptsData.map(async (prompt) => {
            try {
              const fields = await promptFieldService.getFieldsForPrompt(prompt.id);
              return {
                ...prompt,
                fields
              };
            } catch (err) {
              console.error(`Failed to load fields for prompt ${prompt.id}:`, err);
              return {
                ...prompt,
                fields: []
              };
            }
          })
        );
        
        setPrompts(promptsWithFields);
        setCategories(categoriesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch prompts');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const searchPrompts = async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const results = await promptService.search(query);
      
      // Load fields for each prompt
      const promptsWithFields = await Promise.all(
        results.map(async (prompt) => {
          try {
            const fields = await promptFieldService.getFieldsForPrompt(prompt.id);
            return {
              ...prompt,
              fields
            };
          } catch (err) {
            console.error(`Failed to load fields for prompt ${prompt.id}:`, err);
            return {
              ...prompt,
              fields: []
            };
          }
        })
      );
      
      setPrompts(promptsWithFields);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search prompts');
    } finally {
      setLoading(false);
    }
  };

  const getPromptsByCategory = async (categoryId: string) => {
    try {
      setLoading(true);
      setError(null);
      const results = await promptService.getByCategory(categoryId);
      
      // Load fields for each prompt
      const promptsWithFields = await Promise.all(
        results.map(async (prompt) => {
          try {
            const fields = await promptFieldService.getFieldsForPrompt(prompt.id);
            return {
              ...prompt,
              fields
            };
          } catch (err) {
            console.error(`Failed to load fields for prompt ${prompt.id}:`, err);
            return {
              ...prompt,
              fields: []
            };
          }
        })
      );
      
      setPrompts(promptsWithFields);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prompts by category');
    } finally {
      setLoading(false);
    }
  };

  const getPromptFields = async (promptId: string): Promise<PromptField[]> => {
    try {
      return await promptFieldService.getFieldsForPrompt(promptId);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch prompt fields');
    }
  };

  const resetPrompts = async () => {
    try {
      setLoading(true);
      setError(null);
      const results = await promptService.getAll();
      
      // Load fields for each prompt
      const promptsWithFields = await Promise.all(
        results.map(async (prompt) => {
          try {
            const fields = await promptFieldService.getFieldsForPrompt(prompt.id);
            return {
              ...prompt,
              fields
            };
          } catch (err) {
            console.error(`Failed to load fields for prompt ${prompt.id}:`, err);
            return {
              ...prompt,
              fields: []
            };
          }
        })
      );
      
      setPrompts(promptsWithFields);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset prompts');
    } finally {
      setLoading(false);
    }
  };

  return {
    prompts,
    categories,
    loading,
    error,
    searchPrompts,
    getPromptsByCategory,
    getPromptFields,
    resetPrompts
  };
}; 
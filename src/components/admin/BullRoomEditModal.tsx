"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, MessageSquare, Trash2, Copy, Plus, Edit } from 'lucide-react';
import { BullRoom } from '../../lib/database.aliases';

interface BullRoomEditModalProps {
  room: BullRoom;
  onClose: () => void;
  onSubmit: (room: Partial<BullRoom> & { id: string }) => Promise<void>;
  loading: boolean;
  generateSlug: (name: string) => string;
}

interface Rule {
  id: string;
  number: number;
  title: string;
  description: string;
}

export const BullRoomEditModal: React.FC<BullRoomEditModalProps> = ({
  room,
  onClose,
  onSubmit,
  loading,
  generateSlug
}) => {
  const [formData, setFormData] = useState({
    name: room.name,
    slug: room.slug,
    topic: room.topic,
    description: room.description || '',
    is_active: room.is_active || true,
    is_featured: room.is_featured || false,
    sort_order: room.sort_order || 0,
    rules: room.rules || []
  });

  const [rules, setRules] = useState<Rule[]>([]);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [ruleTitle, setRuleTitle] = useState('');
  const [ruleDescription, setRuleDescription] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Update form data when room prop changes
  useEffect(() => {
    setFormData({
      name: room.name,
      slug: room.slug,
      topic: room.topic,
      description: room.description || '',
      is_active: room.is_active || true,
      is_featured: room.is_featured || false,
      sort_order: room.sort_order || 0,
      rules: room.rules || []
    });

    // Convert existing rules to Rule objects
    const existingRules = Array.isArray(room.rules) ? room.rules : [];
    const ruleObjects: Rule[] = existingRules.map((rule, index) => {
      if (typeof rule === 'string') {
        // Handle legacy string rules
        return {
          id: `rule-${index}`,
          number: index + 1,
          title: `Rule ${index + 1}`,
          description: rule
        };
      } else if (rule && typeof rule === 'object' && 'title' in rule && 'description' in rule) {
        // Handle structured rules
        return {
          id: `rule-${index}`,
          number: (rule as any).number || index + 1,
          title: (rule as any).title || `Rule ${index + 1}`,
          description: (rule as any).description || ''
        };
      } else {
        // Fallback for unknown rule format
        return {
          id: `rule-${index}`,
          number: index + 1,
          title: `Rule ${index + 1}`,
          description: JSON.stringify(rule)
        };
      }
    });
    setRules(ruleObjects);
  }, [room]);

  // Track unsaved changes
  useEffect(() => {
    const hasChanges = 
      formData.name !== room.name ||
      formData.slug !== room.slug ||
      formData.topic !== room.topic ||
      formData.description !== (room.description || '') ||
      formData.is_active !== (room.is_active || true) ||
      formData.is_featured !== (room.is_featured || false) ||
      formData.sort_order !== (room.sort_order || 0) ||
      rules.length !== (Array.isArray(room.rules) ? room.rules.length : 0);
    setHasUnsavedChanges(hasChanges);
  }, [formData, rules, room]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (hasUnsavedChanges) {
          if (confirm('You have unsaved changes. Are you sure you want to close?')) {
            onClose();
          }
        } else {
          onClose();
        }
      } else if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSubmit(e as any);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [hasUnsavedChanges, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ 
      id: room.id, 
      ...formData,
      rules: rules.map(rule => ({
        number: rule.number,
        title: rule.title,
        description: rule.description
      }))
    });
    setHasUnsavedChanges(false);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };

      // Auto-generate slug when name changes
      if (field === 'name' && value) {
        newData.slug = generateSlug(value);
      }

      return newData;
    });
  };

  const addRule = () => {
    setEditingRule(null);
    setRuleTitle('');
    setRuleDescription('');
    setShowRuleModal(true);
  };

  const editRule = (rule: Rule) => {
    setEditingRule(rule);
    setRuleTitle(rule.title);
    setRuleDescription(rule.description);
    setShowRuleModal(true);
  };

  const deleteRule = (ruleId: string) => {
    const deletedRule = rules.find(rule => rule.id === ruleId);
    if (deletedRule) {
      // Renumber remaining rules
      const newRules = rules
        .filter(rule => rule.id !== ruleId)
        .map((rule, index) => ({
          ...rule,
          number: index + 1
        }));
      setRules(newRules);
    }
  };

  const saveRule = () => {
    if (!ruleTitle.trim() || !ruleDescription.trim()) return;

    if (editingRule) {
      // Edit existing rule
      setRules(rules.map(rule => 
        rule.id === editingRule.id 
          ? { ...rule, title: ruleTitle.trim(), description: ruleDescription.trim() }
          : rule
      ));
    } else {
      // Add new rule
      const newRule: Rule = {
        id: `rule-${Date.now()}`,
        number: rules.length + 1,
        title: ruleTitle.trim(),
        description: ruleDescription.trim()
      };
      setRules([...rules, newRule]);
    }

    setShowRuleModal(false);
    setEditingRule(null);
    setRuleTitle('');
    setRuleDescription('');
  };

  const moveRule = (ruleId: string, direction: 'up' | 'down') => {
    const currentIndex = rules.findIndex(rule => rule.id === ruleId);
    if (currentIndex === -1) return;

    const newRules = [...rules];
    if (direction === 'up' && currentIndex > 0) {
      [newRules[currentIndex], newRules[currentIndex - 1]] = [newRules[currentIndex - 1], newRules[currentIndex]];
    } else if (direction === 'down' && currentIndex < rules.length - 1) {
      [newRules[currentIndex], newRules[currentIndex + 1]] = [newRules[currentIndex + 1], newRules[currentIndex]];
    }

    // Renumber all rules
    const renumberedRules = newRules.map((rule, index) => ({
      ...rule,
      number: index + 1
    }));

    setRules(renumberedRules);
  };

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'var(--color-bg-primary)',
      zIndex: 'var(--z-modal)',
      display: 'flex',
      flexDirection: 'column',
      animation: 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards'
    }}>
      {/* Header */}
      <div style={{
        background: 'var(--color-bg-card)',
        borderBottom: '0.5px solid var(--color-border-primary)',
        padding: 'var(--space-4) var(--space-6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '80px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)'
        }}>
          <div>
            <h1 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-bold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-1)'
            }}>
              Edit Bull Room
            </h1>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-tertiary)'
            }}>
              Update room settings and configuration
            </p>
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)'
        }}>
          {hasUnsavedChanges && (
            <span style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-warning)',
              fontStyle: 'italic'
            }}>
              Unsaved changes
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost"
            style={{ fontSize: 'var(--text-sm)' }}
          >
            <X style={{ width: '16px', height: '16px' }} />
            <span>Cancel</span>
          </button>
          <button
            type="submit"
            form="bull-room-edit-form"
            disabled={loading}
            className="btn btn-primary"
            style={{ fontSize: 'var(--text-sm)' }}
          >
            <Save style={{ width: '16px', height: '16px' }} />
            <span>{loading ? 'Updating...' : 'Update Room'}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: 'var(--space-6)'
      }}>
        <form id="bull-room-edit-form" onSubmit={handleSubmit}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-6)',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {/* Left Column */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)'
            }}>
              {/* Room Name */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-2)'
                }}>
                  Room Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    height: 'var(--input-height)',
                    padding: '0 var(--space-3)',
                    background: 'var(--color-bg-tertiary)',
                    border: '0.5px solid var(--color-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--text-base)'
                  }}
                  placeholder="Enter room name"
                />
              </div>

              {/* Slug */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-2)'
                }}>
                  Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleChange('slug', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    height: 'var(--input-height)',
                    padding: '0 var(--space-3)',
                    background: 'var(--color-bg-tertiary)',
                    border: '0.5px solid var(--color-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--text-base)'
                  }}
                  placeholder="room-slug"
                />
              </div>

              {/* Topic */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-2)'
                }}>
                  Topic *
                </label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => handleChange('topic', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    height: 'var(--input-height)',
                    padding: '0 var(--space-3)',
                    background: 'var(--color-bg-tertiary)',
                    border: '0.5px solid var(--color-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--text-base)'
                  }}
                  placeholder="Brief description of the room topic"
                />
              </div>

              {/* Sort Order */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-2)'
                }}>
                  Sort Order
                </label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => handleChange('sort_order', parseInt(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    height: 'var(--input-height)',
                    padding: '0 var(--space-3)',
                    background: 'var(--color-bg-tertiary)',
                    border: '0.5px solid var(--color-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--text-base)'
                  }}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Right Column */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)'
            }}>
              {/* Description */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-2)'
                }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: 'var(--space-3)',
                    background: 'var(--color-bg-tertiary)',
                    border: '0.5px solid var(--color-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--text-base)',
                    resize: 'vertical',
                    minHeight: '120px'
                  }}
                  placeholder="Detailed description of the room"
                />
              </div>

              {/* Room Rules */}
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--space-3)'
                }}>
                  <label style={{
                    display: 'block',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--color-text-primary)'
                  }}>
                    Room Rules
                  </label>
                  <button
                    type="button"
                    onClick={addRule}
                    className="btn btn-secondary"
                    style={{ fontSize: 'var(--text-xs)' }}
                  >
                    <Plus style={{ width: '12px', height: '12px' }} />
                    <span>Add Rule</span>
                  </button>
                </div>
                
                {rules.length === 0 ? (
                  <div style={{
                    padding: 'var(--space-4)',
                    background: 'var(--color-bg-secondary)',
                    border: '0.5px solid var(--color-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    textAlign: 'center'
                  }}>
                    <p style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-tertiary)',
                      margin: 0
                    }}>
                      No rules set. Click "Add Rule" to create room guidelines.
                    </p>
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-2)'
                  }}>
                    {rules.map((rule) => (
                      <div
                        key={rule.id}
                        style={{
                          padding: 'var(--space-3)',
                          background: 'var(--color-bg-secondary)',
                          border: '0.5px solid var(--color-border-primary)',
                          borderRadius: 'var(--radius-md)'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          marginBottom: 'var(--space-2)'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)',
                            flex: 1
                          }}>
                            <span style={{
                              fontSize: 'var(--text-xs)',
                              color: 'var(--color-text-tertiary)',
                              fontWeight: 'var(--font-medium)',
                              minWidth: '20px'
                            }}>
                              {rule.number}.
                            </span>
                            <span style={{
                              fontSize: 'var(--text-sm)',
                              color: 'var(--color-text-primary)',
                              fontWeight: 'var(--font-medium)'
                            }}>
                              {rule.title}
                            </span>
                          </div>
                          <div style={{
                            display: 'flex',
                            gap: 'var(--space-1)'
                          }}>
                            <button
                              type="button"
                              onClick={() => editRule(rule)}
                              className="btn btn-ghost"
                              style={{ padding: 'var(--space-1)', fontSize: 'var(--text-xs)' }}
                            >
                              <Edit style={{ width: '12px', height: '12px' }} />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteRule(rule.id)}
                              className="btn btn-ghost"
                              style={{ padding: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--color-error)' }}
                            >
                              <Trash2 style={{ width: '12px', height: '12px' }} />
                            </button>
                          </div>
                        </div>
                        <div style={{
                          paddingLeft: 'calc(20px + var(--space-2))'
                        }}>
                          <p style={{
                            fontSize: 'var(--text-sm)',
                            color: 'var(--color-text-secondary)',
                            margin: 0,
                            lineHeight: 'var(--leading-relaxed)'
                          }}>
                            {rule.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Settings */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-3)'
                }}>
                  Room Settings
                </label>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)'
                }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => handleChange('is_active', e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                      Active
                    </span>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => handleChange('is_featured', e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                      Featured
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Rule Modal */}
      {showRuleModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 'var(--z-modal)',
          animation: 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards'
        }}>
          <div style={{
            background: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-6)',
            width: '90%',
            maxWidth: '500px',
            border: '0.5px solid var(--color-border-primary)',
            animation: 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-6)'
            }}>
              <h2 style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--font-bold)',
                color: 'var(--color-text-primary)'
              }}>
                {editingRule ? 'Edit Rule' : 'Add Rule'}
              </h2>
              <button
                onClick={() => setShowRuleModal(false)}
                className="btn btn-ghost"
                style={{ fontSize: 'var(--text-sm)' }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            <div style={{ marginBottom: 'var(--space-6)' }}>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-2)'
                }}>
                  Rule Title *
                </label>
                <input
                  type="text"
                  value={ruleTitle}
                  onChange={(e) => setRuleTitle(e.target.value)}
                  style={{
                    width: '100%',
                    height: 'var(--input-height)',
                    padding: '0 var(--space-3)',
                    background: 'var(--color-bg-tertiary)',
                    border: '0.5px solid var(--color-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--text-base)'
                  }}
                  placeholder="Enter rule title..."
                  autoFocus
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-2)'
                }}>
                  Rule Description *
                </label>
                <textarea
                  value={ruleDescription}
                  onChange={(e) => setRuleDescription(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: 'var(--space-3)',
                    background: 'var(--color-bg-tertiary)',
                    border: '0.5px solid var(--color-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--text-base)',
                    resize: 'vertical'
                  }}
                  placeholder="Enter rule description..."
                />
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: 'var(--space-3)',
              justifyContent: 'flex-end'
            }}>
              <button
                type="button"
                onClick={() => setShowRuleModal(false)}
                className="btn btn-ghost"
                style={{ fontSize: 'var(--text-sm)' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveRule}
                disabled={!ruleTitle.trim() || !ruleDescription.trim()}
                className="btn btn-primary"
                style={{ fontSize: 'var(--text-sm)' }}
              >
                {editingRule ? 'Update Rule' : 'Add Rule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};

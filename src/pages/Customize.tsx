import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { allComponents, componentCategories } from '../components/library';

interface PageComponent {
  id: string;
  type: string;
  category: string;
  code: string;
  element: React.ReactNode;
  isContainer?: boolean;
  containerType?: 'flex-row' | 'flex-col' | 'grid-2' | 'grid-3' | 'grid-4';
  children?: PageComponent[];
  customProps: {
    bgColor?: string;
    textColor?: string;
    borderColor?: string;
    text?: string;
    // Layout properties
    width?: string;
    height?: string;
    maxWidth?: string;
    minHeight?: string;
    // Spacing properties
    marginTop?: string;
    marginRight?: string;
    marginBottom?: string;
    marginLeft?: string;
    paddingTop?: string;
    paddingRight?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    // Alignment
    alignment?: 'left' | 'center' | 'right' | 'justify';
    // Display
    display?: string;
    // Container properties
    gap?: string;
    justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
    alignItems?: 'start' | 'center' | 'end' | 'stretch';
    flexWrap?: 'wrap' | 'nowrap';
  };
}

interface SortableItemProps {
  id: string;
  component: PageComponent;
  onRemove: (id: string) => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  isMultiSelected: boolean;
  selectedComponentId: string | null;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, component, onRemove, onSelect, isSelected, onToggleSelect, isMultiSelected, selectedComponentId }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group bg-white dark:bg-slate-900 rounded-lg p-4 cursor-pointer transition-all ${
        component.isContainer || component.customProps.alignment ? 'w-full' : 'flex-shrink-0'
      } ${
        isMultiSelected ? 'ring-2 ring-purple-500 shadow-lg' :
        isSelected ? 'ring-2 ring-blue-500 shadow-lg' :
        'border-2 border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500'
      }`}
    >
      {/* Multi-Select Checkbox */}
      <div className="absolute left-2 top-2 z-20">
        <input
          type="checkbox"
          checked={isMultiSelected}
          onChange={(e) => {
            e.stopPropagation();
            onToggleSelect(id);
          }}
          className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-2 focus:ring-purple-500 cursor-pointer"
          title="Select for grouping"
        />
      </div>

      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="absolute left-12 top-2 cursor-grab active:cursor-grabbing bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded p-2.5 transition-colors z-20 touch-none"
        title="Drag to reorder"
        type="button"
      >
        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </button>

      {/* Remove Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(id);
        }}
        className="absolute right-2 top-2 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-600 dark:text-red-300 rounded p-2.5 transition-colors z-20"
        title="Remove component"
        type="button"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Component Preview - Wrapper handles spacing & layout */}
      <div
        className={`pt-10 ${component.customProps.alignment ? 'flex' : ''} ${
          component.customProps.alignment === 'left' ? 'justify-start' :
          component.customProps.alignment === 'center' ? 'justify-center' :
          component.customProps.alignment === 'right' ? 'justify-end' : ''
        }`}
        onClick={() => onSelect(id)}
        style={{
          // Margins on wrapper - creates space BETWEEN components
          marginTop: component.customProps.marginTop || '0',
          marginRight: component.customProps.marginRight || '0',
          marginBottom: component.customProps.marginBottom || '0',
          marginLeft: component.customProps.marginLeft || '0',
        }}
      >
        {component.isContainer ? (
          // Render Container with Tailwind classes
          <div
            className={`
              w-full
              ${component.containerType === 'flex-row' ? 'flex flex-row' : ''}
              ${component.containerType === 'flex-col' ? 'flex flex-col' : ''}
              ${component.containerType === 'grid-2' ? 'grid grid-cols-2' : ''}
              ${component.containerType === 'grid-3' ? 'grid grid-cols-3' : ''}
              ${component.containerType === 'grid-4' ? 'grid grid-cols-4' : ''}
              ${component.customProps.gap ? `gap-${component.customProps.gap}` : 'gap-4'}
              ${component.customProps.justify ? `justify-${component.customProps.justify}` : ''}
              ${component.customProps.alignItems ? `items-${component.customProps.alignItems}` : ''}
              ${component.customProps.flexWrap === 'wrap' ? 'flex-wrap' : ''}
              p-4 border-4 border-dashed border-purple-300 dark:border-purple-600 rounded-lg bg-purple-50/50 dark:bg-purple-900/20 min-h-[100px]
            `.trim()}
            style={{
              backgroundColor: component.customProps.bgColor,
              paddingTop: component.customProps.paddingTop,
              paddingRight: component.customProps.paddingRight,
              paddingBottom: component.customProps.paddingBottom,
              paddingLeft: component.customProps.paddingLeft,
            }}
          >
            {component.children && component.children.length > 0 ? (
              component.children.map((child) => (
                <div
                  key={child.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(child.id);
                  }}
                  className={`flex-shrink-0 cursor-pointer p-2 rounded transition-all ${
                    isSelected && selectedComponentId === child.id
                      ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'hover:ring-2 hover:ring-blue-300 dark:hover:ring-blue-600'
                  }`}
                  title="Click to customize this component"
                >
                  {React.isValidElement(child.element) ? (() => {
                    const elem = child.element as React.ReactElement<any>;
                    const existingStyle = typeof elem.props?.style === 'object' ? elem.props.style : {};

                    return React.cloneElement(elem, {
                      style: {
                        ...existingStyle,
                        backgroundColor: child.customProps.bgColor || existingStyle?.backgroundColor,
                        color: child.customProps.textColor || existingStyle?.color,
                        borderColor: child.customProps.borderColor || existingStyle?.borderColor,
                        width: child.customProps.width || existingStyle?.width,
                        height: child.customProps.height || existingStyle?.height,
                        paddingTop: child.customProps.paddingTop && child.customProps.paddingTop !== '0' ? child.customProps.paddingTop : existingStyle?.paddingTop,
                        paddingRight: child.customProps.paddingRight && child.customProps.paddingRight !== '0' ? child.customProps.paddingRight : existingStyle?.paddingRight,
                        paddingBottom: child.customProps.paddingBottom && child.customProps.paddingBottom !== '0' ? child.customProps.paddingBottom : existingStyle?.paddingBottom,
                        paddingLeft: child.customProps.paddingLeft && child.customProps.paddingLeft !== '0' ? child.customProps.paddingLeft : existingStyle?.paddingLeft,
                      }
                    });
                  })() : child.element}
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">
                Container ({component.type}) - No components inside
              </div>
            )}
          </div>
        ) : (
          // Render regular component
          React.isValidElement(component.element) ? (() => {
            const elem = component.element as React.ReactElement<any>;
            const existingStyle = typeof elem.props?.style === 'object' ? elem.props.style : {};

            return React.cloneElement(elem, {
              style: {
                ...existingStyle,
                // Colors
                backgroundColor: component.customProps.bgColor || existingStyle?.backgroundColor,
                color: component.customProps.textColor || existingStyle?.color,
                borderColor: component.customProps.borderColor || existingStyle?.borderColor,
                // Dimensions on component
                width: component.customProps.width || 'auto',
                height: component.customProps.height || existingStyle?.height,
                maxWidth: component.customProps.maxWidth && component.customProps.maxWidth !== 'none' ? component.customProps.maxWidth : existingStyle?.maxWidth,
                minHeight: component.customProps.minHeight && component.customProps.minHeight !== 'auto' ? component.customProps.minHeight : existingStyle?.minHeight,
                // Padding on component - creates space INSIDE component
                paddingTop: component.customProps.paddingTop && component.customProps.paddingTop !== '0' ? component.customProps.paddingTop : existingStyle?.paddingTop,
                paddingRight: component.customProps.paddingRight && component.customProps.paddingRight !== '0' ? component.customProps.paddingRight : existingStyle?.paddingRight,
                paddingBottom: component.customProps.paddingBottom && component.customProps.paddingBottom !== '0' ? component.customProps.paddingBottom : existingStyle?.paddingBottom,
                paddingLeft: component.customProps.paddingLeft && component.customProps.paddingLeft !== '0' ? component.customProps.paddingLeft : existingStyle?.paddingLeft,
              }
            });
          })() : component.element
        )}
      </div>
    </div>
  );
};

const Customize: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [pageComponents, setPageComponents] = useState<PageComponent[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [selectedComponentIds, setSelectedComponentIds] = useState<string[]>([]);
  const [showCode, setShowCode] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [useSemanticHTML, setUseSemanticHTML] = useState(false);
  const [isCustomizePanelMinimized, setIsCustomizePanelMinimized] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setPageComponents((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addComponentToPage = (component: any, category: string) => {
    const newComponent: PageComponent = {
      id: `${category}-${component.name}-${Date.now()}`,
      type: component.name,
      category,
      code: component.code,
      element: component.preview,
      customProps: {},
    };
    setPageComponents([...pageComponents, newComponent]);
  };

  const removeComponent = (id: string) => {
    setPageComponents(pageComponents.filter((comp) => comp.id !== id));
    if (selectedComponentId === id) {
      setSelectedComponentId(null);
    }
  };

  const updateComponentProps = (id: string, props: Partial<PageComponent['customProps']>) => {
    setPageComponents(pageComponents.map(comp => {
      // Update top-level component
      if (comp.id === id) {
        return { ...comp, customProps: { ...comp.customProps, ...props } };
      }
      // Update child inside container
      if (comp.isContainer && comp.children) {
        const updatedChildren = comp.children.map(child =>
          child.id === id
            ? { ...child, customProps: { ...child.customProps, ...props } }
            : child
        );
        if (updatedChildren !== comp.children) {
          return { ...comp, children: updatedChildren };
        }
      }
      return comp;
    }));
  };

  const findComponent = (id: string): PageComponent | undefined => {
    // Check top-level components
    const topLevel = pageComponents.find(c => c.id === id);
    if (topLevel) return topLevel;

    // Check inside containers
    for (const comp of pageComponents) {
      if (comp.isContainer && comp.children) {
        const child = comp.children.find(c => c.id === id);
        if (child) return child;
      }
    }
    return undefined;
  };

  const toggleComponentSelection = (id: string) => {
    setSelectedComponentIds(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const groupComponents = (containerType: 'flex-row' | 'flex-col' | 'grid-2' | 'grid-3' | 'grid-4') => {
    if (selectedComponentIds.length < 2) return;

    const selectedComps = pageComponents.filter(comp => selectedComponentIds.includes(comp.id));
    const remainingComps = pageComponents.filter(comp => !selectedComponentIds.includes(comp.id));

    const containerName = {
      'flex-row': 'Flex Row',
      'flex-col': 'Flex Column',
      'grid-2': 'Grid 2 Columns',
      'grid-3': 'Grid 3 Columns',
      'grid-4': 'Grid 4 Columns',
    }[containerType];

    const newContainer: PageComponent = {
      id: `container-${Date.now()}`,
      type: containerName,
      category: 'Container',
      code: '',
      element: null,
      isContainer: true,
      containerType,
      children: selectedComps,
      customProps: {
        gap: '4',
        justify: 'start',
        alignItems: 'start',
        flexWrap: 'nowrap',
      },
    };

    // Insert container at the position of the first selected component
    const firstSelectedIndex = pageComponents.findIndex(comp => comp.id === selectedComponentIds[0]);
    const newComponents = [...remainingComps];
    newComponents.splice(firstSelectedIndex, 0, newContainer);

    setPageComponents(newComponents);
    setSelectedComponentIds([]);
    setSelectedComponentId(newContainer.id);
  };

  const ungroupContainer = (containerId: string) => {
    const container = pageComponents.find(comp => comp.id === containerId);
    if (!container || !container.isContainer || !container.children) return;

    // Get the position of the container
    const containerIndex = pageComponents.findIndex(comp => comp.id === containerId);

    // Get all components except the container
    const remainingComps = pageComponents.filter(comp => comp.id !== containerId);

    // Insert the children back at the container's position
    const newComponents = [...remainingComps];
    newComponents.splice(containerIndex, 0, ...container.children);

    setPageComponents(newComponents);
    setSelectedComponentId(null);
    toast.success('Container ungrouped successfully!');
  };

  const selectedComponent = selectedComponentId ? findComponent(selectedComponentId) : undefined;

  // Helper function to get semantic HTML tag for a component category
  const getSemanticTag = (category: string): string => {
    const semanticMapping: { [key: string]: string } = {
      'Headers': 'header',
      'Footers': 'footer',
      'Navigation': 'nav',
      'Cards': 'article',
      'Data Display': 'section',
      'Tables': 'section',
      'Forms': 'form',
      'Container': 'section',
    };
    return semanticMapping[category] || 'div';
  };

  // Helper function to generate inline styles for containers and their children
  const generateInlineStyles = (props: PageComponent['customProps'], isContainerChild: boolean = false): string => {
    const styles: string[] = [];

    // Colors
    if (props.bgColor) styles.push(`backgroundColor: '${props.bgColor}'`);
    if (props.textColor) styles.push(`color: '${props.textColor}'`);
    if (props.borderColor) styles.push(`borderColor: '${props.borderColor}'`);

    // Dimensions
    if (props.width) styles.push(`width: '${props.width}'`);
    if (props.height) styles.push(`height: '${props.height}'`);
    if (props.maxWidth && props.maxWidth !== 'none') styles.push(`maxWidth: '${props.maxWidth}'`);
    if (props.minHeight && props.minHeight !== 'auto') styles.push(`minHeight: '${props.minHeight}'`);

    // Padding - space INSIDE component
    if (props.paddingTop && props.paddingTop !== '0') styles.push(`paddingTop: '${props.paddingTop}'`);
    if (props.paddingRight && props.paddingRight !== '0') styles.push(`paddingRight: '${props.paddingRight}'`);
    if (props.paddingBottom && props.paddingBottom !== '0') styles.push(`paddingBottom: '${props.paddingBottom}'`);
    if (props.paddingLeft && props.paddingLeft !== '0') styles.push(`paddingLeft: '${props.paddingLeft}'`);

    // Only add margins for container children (margins on containers are handled by wrapper)
    if (isContainerChild) {
      if (props.marginTop && props.marginTop !== '0') styles.push(`marginTop: '${props.marginTop}'`);
      if (props.marginRight && props.marginRight !== '0') styles.push(`marginRight: '${props.marginRight}'`);
      if (props.marginBottom && props.marginBottom !== '0') styles.push(`marginBottom: '${props.marginBottom}'`);
      if (props.marginLeft && props.marginLeft !== '0') styles.push(`marginLeft: '${props.marginLeft}'`);
    }

    if (props.display) styles.push(`display: '${props.display}'`);

    return styles.length > 0 ? ` style={{ ${styles.join(', ')} }}` : '';
  };

  const generateFullPageCode = () => {
    if (pageComponents.length === 0) {
      return '// No components added yet. Add components from the library to generate code.';
    }

    const generateComponentCode = (comp: PageComponent, indent: string = '  '): string => {
      if (comp.isContainer) {
        // Generate container with Tailwind classes
        const containerClasses: string[] = ['w-full'];

        // Container type
        if (comp.containerType === 'flex-row') containerClasses.push('flex', 'flex-row');
        else if (comp.containerType === 'flex-col') containerClasses.push('flex', 'flex-col');
        else if (comp.containerType === 'grid-2') containerClasses.push('grid', 'grid-cols-2');
        else if (comp.containerType === 'grid-3') containerClasses.push('grid', 'grid-cols-3');
        else if (comp.containerType === 'grid-4') containerClasses.push('grid', 'grid-cols-4');

        // Gap
        if (comp.customProps.gap) containerClasses.push(`gap-${comp.customProps.gap}`);

        // Justify
        if (comp.customProps.justify) containerClasses.push(`justify-${comp.customProps.justify}`);

        // Align items
        if (comp.customProps.alignItems) containerClasses.push(`items-${comp.customProps.alignItems}`);

        // Flex wrap
        if (comp.customProps.flexWrap === 'wrap') containerClasses.push('flex-wrap');

        const className = containerClasses.join(' ');
        const styleAttr = generateInlineStyles(comp.customProps);
        const containerTag = useSemanticHTML ? getSemanticTag(comp.category) : 'div';

        // Generate children code
        const childrenCode = comp.children && comp.children.length > 0
          ? comp.children.map(child => {
              const childCode = child.code.trim();
              const childStyleAttr = generateInlineStyles(child.customProps, true);

              let finalChildCode = childCode;
              if (childStyleAttr) {
                const firstTagEnd = childCode.indexOf('>');
                if (firstTagEnd !== -1) {
                  const hasStyle = childCode.substring(0, firstTagEnd).includes('style=');
                  if (hasStyle) {
                    finalChildCode = childCode.replace(/style=\{[^}]*\}/, childStyleAttr.trim());
                  } else {
                    finalChildCode = childCode.substring(0, firstTagEnd) + childStyleAttr + childCode.substring(firstTagEnd);
                  }
                }
              }

              return finalChildCode.split('\n').map(line => indent + '  ' + line).join('\n');
            }).join('\n\n')
          : indent + '  {/* Empty container */}';

        return `${indent}<${containerTag} className="${className}"${styleAttr}>\n${childrenCode}\n${indent}</${containerTag}>`;
      } else {
        // Generate regular component with wrapper for spacing
        const componentCode = comp.code.trim();
        const wrapperTag = useSemanticHTML ? getSemanticTag(comp.category) : 'div';

        // Spacing styles for wrapper (margin, padding, alignment, dimensions)
        const wrapperStyles: string[] = [];
        if (comp.customProps.bgColor) wrapperStyles.push(`backgroundColor: '${comp.customProps.bgColor}'`);

        // Margins - applied to wrapper (space BETWEEN components)
        if (comp.customProps.marginTop && comp.customProps.marginTop !== '0') wrapperStyles.push(`marginTop: '${comp.customProps.marginTop}'`);
        if (comp.customProps.marginRight && comp.customProps.marginRight !== '0') wrapperStyles.push(`marginRight: '${comp.customProps.marginRight}'`);
        if (comp.customProps.marginBottom && comp.customProps.marginBottom !== '0') wrapperStyles.push(`marginBottom: '${comp.customProps.marginBottom}'`);
        if (comp.customProps.marginLeft && comp.customProps.marginLeft !== '0') wrapperStyles.push(`marginLeft: '${comp.customProps.marginLeft}'`);

        // Component-specific styles (padding, colors, dimensions)
        const componentStyles: string[] = [];

        // Padding - applied to component (space INSIDE component)
        if (comp.customProps.paddingTop && comp.customProps.paddingTop !== '0') componentStyles.push(`paddingTop: '${comp.customProps.paddingTop}'`);
        if (comp.customProps.paddingRight && comp.customProps.paddingRight !== '0') componentStyles.push(`paddingRight: '${comp.customProps.paddingRight}'`);
        if (comp.customProps.paddingBottom && comp.customProps.paddingBottom !== '0') componentStyles.push(`paddingBottom: '${comp.customProps.paddingBottom}'`);
        if (comp.customProps.paddingLeft && comp.customProps.paddingLeft !== '0') componentStyles.push(`paddingLeft: '${comp.customProps.paddingLeft}'`);

        // Colors and dimensions
        if (comp.customProps.textColor) componentStyles.push(`color: '${comp.customProps.textColor}'`);
        if (comp.customProps.borderColor) componentStyles.push(`borderColor: '${comp.customProps.borderColor}'`);
        if (comp.customProps.width) componentStyles.push(`width: '${comp.customProps.width}'`);
        if (comp.customProps.height) componentStyles.push(`height: '${comp.customProps.height}'`);
        if (comp.customProps.maxWidth && comp.customProps.maxWidth !== 'none') componentStyles.push(`maxWidth: '${comp.customProps.maxWidth}'`);

        // Generate wrapper className for alignment
        const wrapperClasses: string[] = [];
        if (comp.customProps.alignment) {
          wrapperClasses.push('flex');
          if (comp.customProps.alignment === 'left') wrapperClasses.push('justify-start');
          else if (comp.customProps.alignment === 'center') wrapperClasses.push('justify-center');
          else if (comp.customProps.alignment === 'right') wrapperClasses.push('justify-end');
        }

        const wrapperClassName = wrapperClasses.length > 0 ? ` className="${wrapperClasses.join(' ')}"` : '';
        const wrapperStyleAttr = wrapperStyles.length > 0 ? ` style={{ ${wrapperStyles.join(', ')} }}` : '';
        const componentStyleAttr = componentStyles.length > 0 ? ` style={{ ${componentStyles.join(', ')} }}` : '';

        // Apply component-specific styles to the component code
        let styledComponentCode = componentCode;
        if (componentStyleAttr) {
          const firstTagEnd = componentCode.indexOf('>');
          if (firstTagEnd !== -1) {
            const hasStyle = componentCode.substring(0, firstTagEnd).includes('style=');
            if (hasStyle) {
              styledComponentCode = componentCode.replace(/style=\{[^}]*\}/, componentStyleAttr.trim());
            } else {
              styledComponentCode = componentCode.substring(0, firstTagEnd) + componentStyleAttr + componentCode.substring(firstTagEnd);
            }
          }
        }

        const indentedCode = styledComponentCode.split('\n').map(line => indent + '  ' + line).join('\n');

        // Wrap component with spacing wrapper
        return `${indent}<${wrapperTag}${wrapperClassName}${wrapperStyleAttr}>\n${indentedCode}\n${indent}</${wrapperTag}>`;
      }
    };

    const componentCodes = pageComponents.map(comp => generateComponentCode(comp)).join('\n\n');
    const containerTag = useSemanticHTML ? 'main' : 'div';

    return `<${containerTag} className="min-h-screen bg-gray-50 dark:bg-slate-800">
  <div className="w-full space-y-0">
${componentCodes}
  </div>
</${containerTag}>`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateFullPageCode());
    toast.success('Code copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800 flex flex-col">
      {/* Top Row - Canvas + Customization Panel */}
      <div className="flex flex-row w-full">
        {/* Center - Canvas Area */}
        <div className="p-4 sm:p-6 transition-all duration-300" style={{ width: isCustomizePanelMinimized ? '95vw' : '70vw' }}>
        <div className="w-full min-w-[1024px]">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md p-4 sm:p-6 mb-6 w-full">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 break-words">
                  Canvas <span className="text-base sm:text-lg font-normal text-slate-500 dark:text-slate-400">({pageComponents.length})</span>
                </h2>

                {/* Semantic HTML Toggle */}
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-2 sm:px-3 py-1.5">
                  <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">Semantic</span>
                  <button
                    onClick={() => setUseSemanticHTML(!useSemanticHTML)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      useSemanticHTML ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                    title={useSemanticHTML ? 'Using semantic tags (header, footer, nav, etc.)' : 'Using div tags'}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        useSemanticHTML ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex gap-1 items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1.5 shadow-sm border border-slate-200 dark:border-slate-600">
                {/* Preview Icon */}
                <button
                  onClick={() => {
                    setShowPreview(!showPreview);
                    setShowCode(false);
                  }}
                  className={`p-2 rounded-md transition-colors ${
                    showPreview
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                  }`}
                  title="Preview"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>

                {/* Code Icon */}
                <button
                  onClick={() => {
                    setShowCode(!showCode);
                    setShowPreview(false);
                  }}
                  className={`p-2 rounded-md transition-colors ${
                    showCode
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                  }`}
                  title="View Code"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </button>

                {/* Copy Icon */}
                <button
                  onClick={handleCopyCode}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-md transition-colors"
                  title="Copy Code"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Grouping Action Buttons - Show when 2+ components selected */}
            {selectedComponentIds.length >= 2 && (
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-200 dark:border-purple-700 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-semibold text-purple-800 dark:text-purple-200">
                    {selectedComponentIds.length} components selected
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => groupComponents('flex-row')}
                    className="px-6 py-3 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-600 font-semibold rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-200 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    Side by Side
                  </button>
                  <button
                    onClick={() => groupComponents('flex-col')}
                    className="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-600 font-semibold rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    Stack Vertically
                  </button>
                  <button
                    onClick={() => groupComponents('grid-2')}
                    className="px-6 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-600 font-semibold rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors duration-200 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                    Grid 2 Cols
                  </button>
                  <button
                    onClick={() => groupComponents('grid-3')}
                    className="px-6 py-3 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 border border-cyan-600 font-semibold rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-colors duration-200 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    Grid 3 Cols
                  </button>
                  <button
                    onClick={() => groupComponents('grid-4')}
                    className="px-6 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-600 font-semibold rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors duration-200 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    Grid 4 Cols
                  </button>
                </div>
              </div>
            )}

            {pageComponents.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-800">
                <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                  No components yet
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                  Add components from the library to start building
                </p>
              </div>
            ) : (
              <div className="w-full">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={pageComponents.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-wrap gap-3 w-full">
                      {pageComponents.map((component) => (
                        <SortableItem
                          key={component.id}
                          id={component.id}
                          component={component}
                          onRemove={removeComponent}
                          onSelect={setSelectedComponentId}
                          isSelected={selectedComponentId === component.id}
                          onToggleSelect={toggleComponentSelection}
                          isMultiSelected={selectedComponentIds.includes(component.id)}
                          selectedComponentId={selectedComponentId}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </div>

          {/* Code Preview */}
          {showCode && (
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md p-4 sm:p-6 w-full">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Generated Code</h2>
              <div className="bg-gray-900 dark:bg-slate-950 rounded-lg p-4 overflow-x-auto w-full">
                <pre className="text-xs sm:text-sm text-gray-100 whitespace-pre-wrap break-words">
                  <code>{generateFullPageCode()}</code>
                </pre>
              </div>
            </div>
          )}

          {/* Preview Modal */}
          {showPreview && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-[98vw] h-[96vh] flex flex-col overflow-hidden">
                {/* Preview Header */}
                <div className="flex justify-between items-center p-3 sm:p-4 border-b bg-gray-50 dark:bg-slate-800 dark:border-slate-700 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">Live Preview</h2>
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-slate-700 px-2 sm:px-3 py-1 rounded-full">Desktop View</span>
                  </div>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Preview Content */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900">
                  <div className="w-full space-y-0 p-4">
                    {pageComponents.map((component) => (
                      <div key={component.id} className={`mb-4 ${component.isContainer || component.customProps.alignment ? 'w-full' : ''}`}>
                        {component.isContainer ? (
                          // Render Container
                          <div
                            className={`
                              w-full
                              ${component.containerType === 'flex-row' ? 'flex flex-row' : ''}
                              ${component.containerType === 'flex-col' ? 'flex flex-col' : ''}
                              ${component.containerType === 'grid-2' ? 'grid grid-cols-2' : ''}
                              ${component.containerType === 'grid-3' ? 'grid grid-cols-3' : ''}
                              ${component.containerType === 'grid-4' ? 'grid grid-cols-4' : ''}
                              ${component.customProps.gap ? `gap-${component.customProps.gap}` : 'gap-4'}
                              ${component.customProps.justify ? `justify-${component.customProps.justify}` : ''}
                              ${component.customProps.alignItems ? `items-${component.customProps.alignItems}` : ''}
                              ${component.customProps.flexWrap === 'wrap' ? 'flex-wrap' : ''}
                            `.trim()}
                            style={{
                              backgroundColor: component.customProps.bgColor,
                              paddingTop: component.customProps.paddingTop,
                              paddingRight: component.customProps.paddingRight,
                              paddingBottom: component.customProps.paddingBottom,
                              paddingLeft: component.customProps.paddingLeft,
                            }}
                          >
                            {component.children && component.children.map((child) => (
                              <div key={child.id}>
                                {React.isValidElement(child.element) ? (() => {
                                  const elem = child.element as React.ReactElement<any>;
                                  const existingStyle = typeof elem.props?.style === 'object' ? elem.props.style : {};

                                  return React.cloneElement(elem, {
                                    style: {
                                      ...existingStyle,
                                      backgroundColor: child.customProps.bgColor || existingStyle?.backgroundColor,
                                      color: child.customProps.textColor || existingStyle?.color,
                                      borderColor: child.customProps.borderColor || existingStyle?.borderColor,
                                      width: child.customProps.width || existingStyle?.width,
                                      height: child.customProps.height || existingStyle?.height,
                                      paddingTop: child.customProps.paddingTop && child.customProps.paddingTop !== '0' ? child.customProps.paddingTop : existingStyle?.paddingTop,
                                      paddingRight: child.customProps.paddingRight && child.customProps.paddingRight !== '0' ? child.customProps.paddingRight : existingStyle?.paddingRight,
                                      paddingBottom: child.customProps.paddingBottom && child.customProps.paddingBottom !== '0' ? child.customProps.paddingBottom : existingStyle?.paddingBottom,
                                      paddingLeft: child.customProps.paddingLeft && child.customProps.paddingLeft !== '0' ? child.customProps.paddingLeft : existingStyle?.paddingLeft,
                                    }
                                  });
                                })() : child.element}
                              </div>
                            ))}
                          </div>
                        ) : (
                          // Render Regular Component
                          <div
                            className={`relative ${component.customProps.alignment ? 'flex' : ''} ${
                              component.customProps.alignment === 'left' ? 'justify-start' :
                              component.customProps.alignment === 'center' ? 'justify-center' :
                              component.customProps.alignment === 'right' ? 'justify-end' : ''
                            }`}
                            style={{
                              marginTop: component.customProps.marginTop || '0',
                              marginRight: component.customProps.marginRight || '0',
                              marginBottom: component.customProps.marginBottom || '0',
                              marginLeft: component.customProps.marginLeft || '0',
                            }}
                          >
                            {React.isValidElement(component.element) ? (() => {
                                const elem = component.element as React.ReactElement<any>;
                                const existingStyle = typeof elem.props?.style === 'object' ? elem.props.style : {};

                                return React.cloneElement(elem, {
                                  style: {
                                    ...existingStyle,
                                    backgroundColor: component.customProps.bgColor || existingStyle?.backgroundColor,
                                    color: component.customProps.textColor || existingStyle?.color,
                                    borderColor: component.customProps.borderColor || existingStyle?.borderColor,
                                    width: component.customProps.width || 'auto',
                                    height: component.customProps.height || existingStyle?.height,
                                    maxWidth: component.customProps.maxWidth && component.customProps.maxWidth !== 'none' ? component.customProps.maxWidth : existingStyle?.maxWidth,
                                    minHeight: component.customProps.minHeight && component.customProps.minHeight !== 'auto' ? component.customProps.minHeight : existingStyle?.minHeight,
                                    paddingTop: component.customProps.paddingTop && component.customProps.paddingTop !== '0' ? component.customProps.paddingTop : existingStyle?.paddingTop,
                                    paddingRight: component.customProps.paddingRight && component.customProps.paddingRight !== '0' ? component.customProps.paddingRight : existingStyle?.paddingRight,
                                    paddingBottom: component.customProps.paddingBottom && component.customProps.paddingBottom !== '0' ? component.customProps.paddingBottom : existingStyle?.paddingBottom,
                                    paddingLeft: component.customProps.paddingLeft && component.customProps.paddingLeft !== '0' ? component.customProps.paddingLeft : existingStyle?.paddingLeft,
                                  }
                                });
                              })() : component.element}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Customization Panel */}
      <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 shadow-lg border-l border-slate-200 dark:border-slate-700 transition-all duration-300 overflow-hidden flex flex-col" style={{ width: isCustomizePanelMinimized ? '5vw' : '30vw', maxHeight: '100vh' }}>
        {isCustomizePanelMinimized ? (
          // Minimized View - Only Expand Button
          <div className="h-full flex items-start justify-center pt-6">
            <button
              onClick={() => setIsCustomizePanelMinimized(false)}
              className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-lg"
              title="Expand Customize Panel"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>
        ) : (
          // Expanded View - Full Customization Panel
          <>
            {/* Fixed Header */}
            <div className="p-6 pb-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
              <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Customize</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Style your component</p>
                </div>
              </div>
              {/* Minimize Button */}
              <button
                onClick={() => setIsCustomizePanelMinimized(true)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Minimize Panel"
              >
                <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 pt-4">
          {selectedComponent ? (
            <div className="space-y-5">
              {/* Selected Component Info */}
              <div className={`rounded-xl p-4 text-white shadow-lg ${
                selectedComponent.isContainer
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-xs font-medium opacity-90">
                    {selectedComponent.isContainer ? 'Selected Container' : 'Selected Component'}
                  </p>
                </div>
                <p className="text-lg font-bold">{selectedComponent.type}</p>
                {selectedComponent.isContainer && selectedComponent.children && (
                  <p className="text-xs opacity-75 mt-1">
                    {selectedComponent.children.length} component{selectedComponent.children.length !== 1 ? 's' : ''} inside
                  </p>
                )}
              </div>

              {/* Ungroup Button - Only for containers */}
              {selectedComponent.isContainer && (
                <button
                  onClick={() => ungroupContainer(selectedComponent.id)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Ungroup Container
                </button>
              )}

              {/* Container Layout Options - Only for containers */}
              {selectedComponent.isContainer && (
                <>
                  {/* Gap */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Gap (Spacing)
                    </label>
                    <select
                      value={selectedComponent.customProps.gap || '4'}
                      onChange={(e) => updateComponentProps(selectedComponent.id, { gap: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                    >
                      <option value="0">None (0px)</option>
                      <option value="1">0.25rem (4px)</option>
                      <option value="2">0.5rem (8px)</option>
                      <option value="3">0.75rem (12px)</option>
                      <option value="4">1rem (16px)</option>
                      <option value="6">1.5rem (24px)</option>
                      <option value="8">2rem (32px)</option>
                      <option value="12">3rem (48px)</option>
                      <option value="16">4rem (64px)</option>
                    </select>
                  </div>

                  {/* Justify Content */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      Justify Content
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['start', 'center', 'end', 'between', 'around', 'evenly'].map((value) => (
                        <button
                          key={value}
                          onClick={() => updateComponentProps(selectedComponent.id, { justify: value as any })}
                          className={`px-4 py-2.5 rounded-lg font-semibold transition-colors duration-200 ${
                            selectedComponent.customProps.justify === value
                              ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 border border-pink-600'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-transparent hover:bg-slate-200 dark:hover:bg-slate-600'
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Align Items */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      Align Items
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['start', 'center', 'end', 'stretch'].map((value) => (
                        <button
                          key={value}
                          onClick={() => updateComponentProps(selectedComponent.id, { alignItems: value as any })}
                          className={`px-4 py-2.5 rounded-lg font-semibold transition-colors duration-200 ${
                            selectedComponent.customProps.alignItems === value
                              ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-600'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-transparent hover:bg-slate-200 dark:hover:bg-slate-600'
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Flex Wrap - Only for flex containers */}
                  {(selectedComponent.containerType === 'flex-row' || selectedComponent.containerType === 'flex-col') && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
                        <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                        Flex Wrap
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {['wrap', 'nowrap'].map((value) => (
                          <button
                            key={value}
                            onClick={() => updateComponentProps(selectedComponent.id, { flexWrap: value as any })}
                            className={`px-4 py-2.5 rounded-lg font-semibold transition-colors duration-200 ${
                              selectedComponent.customProps.flexWrap === value
                                ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 border border-teal-600'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-transparent hover:bg-slate-200 dark:hover:bg-slate-600'
                            }`}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Background Color */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Background Color
                </label>
                <div className="flex gap-3">
                  <div className="relative">
                    <input
                      type="color"
                      value={selectedComponent.customProps.bgColor || '#ffffff'}
                      onChange={(e) => updateComponentProps(selectedComponent.id, { bgColor: e.target.value })}
                      className="w-14 h-14 rounded-xl border-2 border-slate-300 dark:border-slate-600 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                    />
                  </div>
                  <input
                    type="text"
                    value={selectedComponent.customProps.bgColor || '#ffffff'}
                    onChange={(e) => updateComponentProps(selectedComponent.id, { bgColor: e.target.value })}
                    className="flex-1 px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm transition-all bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              {/* Text Color */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Text Color
                </label>
                <div className="flex gap-3">
                  <div className="relative">
                    <input
                      type="color"
                      value={selectedComponent.customProps.textColor || '#000000'}
                      onChange={(e) => updateComponentProps(selectedComponent.id, { textColor: e.target.value })}
                      className="w-14 h-14 rounded-xl border-2 border-slate-300 dark:border-slate-600 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                    />
                  </div>
                  <input
                    type="text"
                    value={selectedComponent.customProps.textColor || '#000000'}
                    onChange={(e) => updateComponentProps(selectedComponent.id, { textColor: e.target.value })}
                    className="flex-1 px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-mono text-sm transition-all bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                    placeholder="#000000"
                  />
                </div>
              </div>

              {/* Border Color */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  Border Color
                </label>
                <div className="flex gap-3">
                  <div className="relative">
                    <input
                      type="color"
                      value={selectedComponent.customProps.borderColor || '#e5e7eb'}
                      onChange={(e) => updateComponentProps(selectedComponent.id, { borderColor: e.target.value })}
                      className="w-14 h-14 rounded-xl border-2 border-slate-300 dark:border-slate-600 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                    />
                  </div>
                  <input
                    type="text"
                    value={selectedComponent.customProps.borderColor || '#e5e7eb'}
                    onChange={(e) => updateComponentProps(selectedComponent.id, { borderColor: e.target.value })}
                    className="flex-1 px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none font-mono text-sm transition-all bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                    placeholder="#e5e7eb"
                  />
                </div>
              </div>

              {/* Custom Text */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Custom Text
                </label>
                <textarea
                  value={selectedComponent.customProps.text || ''}
                  onChange={(e) => updateComponentProps(selectedComponent.id, { text: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none transition-all bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                  rows={4}
                  placeholder="Enter custom text here..."
                />
              </div>

              {/* Dimensions Section */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  Dimensions
                </label>
                <div className="space-y-3">
                  {/* Width */}
                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">Width</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={selectedComponent.customProps.width || 'auto'}
                        onChange={(e) => updateComponentProps(selectedComponent.id, { width: e.target.value })}
                        className="flex-1 px-3 py-2 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                        placeholder="e.g., 100%, 500px, 50vw"
                      />
                      <select
                        onChange={(e) => updateComponentProps(selectedComponent.id, { width: e.target.value })}
                        className="px-2 py-2 border-2 border-slate-200 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Quick</option>
                        <option value="100%">Full</option>
                        <option value="75%">3/4</option>
                        <option value="50%">1/2</option>
                        <option value="33.333%">1/3</option>
                        <option value="25%">1/4</option>
                      </select>
                    </div>
                  </div>
                  {/* Height */}
                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">Height</label>
                    <input
                      type="text"
                      value={selectedComponent.customProps.height || 'auto'}
                      onChange={(e) => updateComponentProps(selectedComponent.id, { height: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                      placeholder="e.g., auto, 300px, 50vh"
                    />
                  </div>
                  {/* Max Width */}
                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">Max Width</label>
                    <input
                      type="text"
                      value={selectedComponent.customProps.maxWidth || 'none'}
                      onChange={(e) => updateComponentProps(selectedComponent.id, { maxWidth: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                      placeholder="e.g., none, 1200px"
                    />
                  </div>
                </div>
              </div>

              {/* Alignment */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  Alignment
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      const width = selectedComponent.customProps.width && selectedComponent.customProps.width !== 'auto'
                        ? selectedComponent.customProps.width
                        : '50%';
                      updateComponentProps(selectedComponent.id, { alignment: 'left', width });
                    }}
                    className={`px-4 py-2.5 rounded-lg font-semibold transition-colors duration-200 ${
                      selectedComponent.customProps.alignment === 'left'
                        ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 border border-cyan-600'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-transparent hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    Left
                  </button>
                  <button
                    onClick={() => {
                      const width = selectedComponent.customProps.width && selectedComponent.customProps.width !== 'auto'
                        ? selectedComponent.customProps.width
                        : '50%';
                      updateComponentProps(selectedComponent.id, { alignment: 'center', width });
                    }}
                    className={`px-4 py-2.5 rounded-lg font-semibold transition-colors duration-200 ${
                      selectedComponent.customProps.alignment === 'center'
                        ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 border border-cyan-600'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-transparent hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    Center
                  </button>
                  <button
                    onClick={() => {
                      const width = selectedComponent.customProps.width && selectedComponent.customProps.width !== 'auto'
                        ? selectedComponent.customProps.width
                        : '50%';
                      updateComponentProps(selectedComponent.id, { alignment: 'right', width });
                    }}
                    className={`px-4 py-2.5 rounded-lg font-semibold transition-colors duration-200 ${
                      selectedComponent.customProps.alignment === 'right'
                        ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 border border-cyan-600'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-transparent hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    Right
                  </button>
                </div>
                {/* Alignment Info */}
                {selectedComponent.customProps.alignment && (
                  <div className="mt-3 p-2 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg">
                    <p className="text-xs text-cyan-800 dark:text-cyan-300">
                      💡 Component width set to <strong>{selectedComponent.customProps.width || '50%'}</strong>. Adjust width above to see alignment effect.
                    </p>
                  </div>
                )}
              </div>

              {/* Margin Section */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Margin (Outer Spacing)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">Top</label>
                    <input
                      type="text"
                      value={selectedComponent.customProps.marginTop || '0'}
                      onChange={(e) => updateComponentProps(selectedComponent.id, { marginTop: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                      placeholder="0px"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">Bottom</label>
                    <input
                      type="text"
                      value={selectedComponent.customProps.marginBottom || '0'}
                      onChange={(e) => updateComponentProps(selectedComponent.id, { marginBottom: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                      placeholder="0px"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">Left</label>
                    <input
                      type="text"
                      value={selectedComponent.customProps.marginLeft || '0'}
                      onChange={(e) => updateComponentProps(selectedComponent.id, { marginLeft: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                      placeholder="0px"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">Right</label>
                    <input
                      type="text"
                      value={selectedComponent.customProps.marginRight || '0'}
                      onChange={(e) => updateComponentProps(selectedComponent.id, { marginRight: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                      placeholder="0px"
                    />
                  </div>
                </div>
              </div>

              {/* Padding Section */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  Padding (Inner Spacing)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">Top</label>
                    <input
                      type="text"
                      value={selectedComponent.customProps.paddingTop || '0'}
                      onChange={(e) => updateComponentProps(selectedComponent.id, { paddingTop: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                      placeholder="0px"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">Bottom</label>
                    <input
                      type="text"
                      value={selectedComponent.customProps.paddingBottom || '0'}
                      onChange={(e) => updateComponentProps(selectedComponent.id, { paddingBottom: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                      placeholder="0px"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">Left</label>
                    <input
                      type="text"
                      value={selectedComponent.customProps.paddingLeft || '0'}
                      onChange={(e) => updateComponentProps(selectedComponent.id, { paddingLeft: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                      placeholder="0px"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">Right</label>
                    <input
                      type="text"
                      value={selectedComponent.customProps.paddingRight || '0'}
                      onChange={(e) => updateComponentProps(selectedComponent.id, { paddingRight: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                      placeholder="0px"
                    />
                  </div>
                </div>
              </div>

              {/* Apply Changes Button */}
              <button
                onClick={() => {
                  // Force re-render to show all spacing changes
                  setPageComponents([...pageComponents]);
                  // Auto-open preview to show perfect result
                  setShowPreview(true);
                }}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Apply Changes & Preview
              </button>

              {/* Info Note */}
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                    Click "Apply Changes & Preview" to see margins and padding in full desktop view. All customizations are included in exported code.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-600 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
                <p className="text-slate-700 dark:text-slate-200 font-semibold mb-2">No Component Selected</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm px-8">
                  Click on any component in the canvas to start customizing
                </p>
              </div>

              {/* What You Can Customize */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100">What You Can Customize</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">Background Color</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Change the background color of your component</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">Text Color</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Modify text and typography colors</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">Border Color</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Adjust border and outline colors</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">Custom Text</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Edit text content and labels</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-5 border-t border-purple-200 dark:border-purple-800">
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">💡 Pro Tip:</span> All your customizations will be automatically included in the exported code!
                  </p>
                </div>
              </div>
            </div>
          )}
            </div>
          </>
        )}
      </div>
      </div>

      {/* Bottom Row - Component Library (100vw) */}
      <div className="w-full bg-white dark:bg-slate-900 shadow-lg border-t border-slate-200 dark:border-slate-700">
        <div className="p-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 px-2">Component Library</h2>

          {/* Categories with Expandable Components */}
          <div className="space-y-2">
            {componentCategories.map((category) => (
              <div key={category}>
                {/* Category Button */}
                <button
                  onClick={() => setSelectedCategory(selectedCategory === category ? '' : category)}
                  className={`w-full px-4 py-2.5 rounded-lg font-medium text-left transition-all ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600'
                  }`}
                >
                  {category}
                </button>

                {/* Component List - Shows when category is selected */}
                {selectedCategory === category && (
                  <div className="mt-2 mb-2 flex flex-wrap gap-3 pl-2">
                    {allComponents[selectedCategory as keyof typeof allComponents].map((component, index) => (
                      <div
                        key={index}
                        className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all bg-white dark:bg-slate-800 flex-shrink-0"
                        style={{ width: 'auto', minWidth: '200px', maxWidth: '300px' }}
                      >
                        <div className={`mb-3 flex items-center justify-center bg-slate-50 dark:bg-slate-700 rounded-lg overflow-hidden ${
                          selectedCategory === 'Headers' || selectedCategory === 'Footers'
                            ? 'min-h-[100px] p-1'
                            : 'min-h-[80px] p-3'
                        }`}>
                          <div className={`${
                            selectedCategory === 'Headers' || selectedCategory === 'Footers'
                              ? 'scale-[0.35] w-full'
                              : ''
                          }`}>
                            {component.preview}
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-600">
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{component.name}</span>
                          <button
                            onClick={() => addComponentToPage(component, selectedCategory)}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-all font-medium"
                          >
                            + Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customize;

import { useCallback } from 'react';
import { EditorState, Modifier, ContentState, SelectionState, ContentBlock, genKey } from 'draft-js';
import { addImage } from '@widgets/editor/plugins/Image/strategy';
import BlockType from '@entities/enums/BlockType';
import useBlockTypes from '@app/hooks/editor/useBlockTypes';

interface ProcessedContent {
  hasImages: boolean;
  elements: Array<{
    type: 'text' | 'image' | 'heading1' | 'heading2' | 'heading3' | 'numbered-list' | 'bullet-list' | 'table' | 'paragraph';
    content: string;
    data?: any;
    level?: number; // для заголовков и списков
  }>;
}

// Маппинг HTML тегов в типы блоков
const HTML_TO_BLOCK_TYPE: Record<string, string> = {
  'H1': BlockType.Heading1,
  'H2': BlockType.Heading2,
  'H3': BlockType.Heading3,
  'P': BlockType.Text,
  'DIV': BlockType.Text,
  'LI': '', // будет определяться по родительскому элементу
  'OL': BlockType.NumberedList,
  'UL': BlockType.BulletList,
  'TABLE': BlockType.Table,
};

export const useClipboardImagePaste = (setEditorState: (state: EditorState | ((state: EditorState) => EditorState)) => void) => {
  const { toggleBlockType } = useBlockTypes();
  
  const parseHtmlContent = (html: string): ProcessedContent => {
    const result: ProcessedContent = {
      hasImages: false,
      elements: []
    };

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Функция для определения типа элемента
      const getElementType = (element: Element, parentElement?: Element): string => {
        const tagName = element.tagName;
        
        switch (tagName) {
          case 'H1': return 'heading1';
          case 'H2': return 'heading2';
          case 'H3': return 'heading3';
          case 'P': return 'paragraph';
          case 'DIV': return 'paragraph';
          case 'LI':
            if (parentElement?.tagName === 'OL') return 'numbered-list';
            if (parentElement?.tagName === 'UL') return 'bullet-list';
            return 'paragraph';
          case 'TABLE': return 'table';
          default: return 'paragraph';
        }
      };
      
      // НОВАЯ АРХИТЕКТУРА: Обработка узлов строго в DOM порядке без группировки
      const processNodeInOrder = (node: Node): void => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent?.trim();
          if (text) {
            result.elements.push({
              type: 'paragraph',
              content: text
            });
            console.log(`✅ Added text node: "${text.substring(0, 50)}..."`);
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          const tagName = element.tagName;
          
          console.log(`🔍 Processing element in order: ${tagName}`);
          
          switch (tagName) {
            case 'H1':
            case 'H2':
            case 'H3':
              const headingText = element.textContent?.trim();
              if (headingText) {
                const headingType = getElementType(element);
                result.elements.push({
                  type: headingType as any,
                  content: headingText
                });
                console.log(`✅ Added ${headingType}: "${headingText}"`);
              }
              break;
              
            case 'P':
              const paragraphText = element.textContent?.trim();
              if (paragraphText) {
                result.elements.push({
                  type: 'paragraph',
                  content: paragraphText
                });
                console.log(`✅ Added paragraph: "${paragraphText.substring(0, 50)}..."`);
              }
              break;
              
            case 'IMG':
              const src = element.getAttribute('src');
              if (src) {
                result.hasImages = true;
                result.elements.push({
                  type: 'image',
                  content: src,
                  data: {
                    alt: element.getAttribute('alt') || 'Image',
                    title: element.getAttribute('title') || 'Image'
                  }
                });
                console.log(`🖼️ Added image: ${src.substring(0, 50)}...`);
              }
              break;
              
            case 'LI':
              const listItemText = element.textContent?.trim();
              if (listItemText) {
                const parentList = element.parentElement;
                const listType = parentList?.tagName === 'OL' ? 'numbered-list' : 'bullet-list';
                result.elements.push({
                  type: listType,
                  content: listItemText
                });
                console.log(`✅ Added ${listType} item: "${listItemText}"`);
              }
              // Process any images within list item
              Array.from(element.childNodes).forEach(childNode => {
                if (childNode.nodeType === Node.ELEMENT_NODE && (childNode as Element).tagName === 'IMG') {
                  processNodeInOrder(childNode);
                }
              });
              break;
              
            case 'DIV':
            case 'SECTION':
            case 'ARTICLE':
              // Обрабатываем детей контейнера в строгом порядке
              Array.from(element.childNodes).forEach(childNode => {
                processNodeInOrder(childNode);
              });
              break;
              
            case 'UL':
            case 'OL':
              // Обрабатываем элементы списка в порядке
              Array.from(element.children).forEach(child => {
                if (child.tagName === 'LI') {
                  processNodeInOrder(child);
                }
              });
              break;
              
            case 'TABLE':
              processTable(element);
              break;
              
            case 'FIGURE':
              // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Обработка FIGURE элементов (VC.ru, Medium и др.)
              console.log('🖼️ Processing FIGURE element');
              
              // Ищем изображение внутри FIGURE
              const figureImg = element.querySelector('img');
              if (figureImg) {
                const src = figureImg.getAttribute('src');
                if (src) {
                  result.hasImages = true;
                  result.elements.push({
                    type: 'image',
                    content: src,
                    data: {
                      alt: figureImg.getAttribute('alt') || 'Image from figure',
                      title: figureImg.getAttribute('title') || 'Image from figure'
                    }
                  });
                  console.log(`✅ Added image from FIGURE: ${src.substring(0, 50)}...`);
                }
              }
              
              // Также извлекаем текст (caption) если есть
              const figureText = element.textContent?.trim();
              if (figureText) {
                result.elements.push({
                  type: 'paragraph',
                  content: figureText
                });
                console.log(`✅ Added figure caption: "${figureText.substring(0, 50)}..."`);
              }
              break;
              
            default:
              // Для неизвестных элементов обрабатываем содержимое
              const unknownText = element.textContent?.trim();
              if (unknownText) {
                result.elements.push({
                  type: 'paragraph',
                  content: unknownText
                });
                console.log(`✅ Added unknown element as paragraph: "${unknownText.substring(0, 50)}..."`);
              }
              break;
          }
        }
      };
      
      // Функция для обработки таблиц (базовая через новую архитектуру)
      const processTable = (tableElement: Element) => {
        console.log('📊 Processing table');
        // Пока просто извлекаем текстовое содержимое
        // В будущем можно расширить для полной поддержки структуры таблиц
        const tableText = tableElement.textContent?.trim();
        if (tableText) {
          result.elements.push({
            type: 'table',
            content: `Таблица: ${tableText}`,
            data: {
              note: 'Таблицы пока вставляются как текст. Полная поддержка в разработке.'
            }
          });
        }
      };
      

      
      // НОВАЯ АРХИТЕКТУРА: Обрабатываем тело документа строго в DOM порядке
      console.log('🚀 Starting new DOM order processing...');
      const bodyNodes = Array.from(doc.body.childNodes);
      
      bodyNodes.forEach(node => {
        processNodeInOrder(node);
      });

      console.log('📄 Parsed content elements:', result.elements.length);
      console.log('📋 Elements structure:', result.elements.map(el => `${el.type}: ${el.content.substring(0, 30)}...`));
      
      const imageElements = result.elements.filter(el => el.type === 'image');
      console.log('🖼️ Total images found:', imageElements.length);
      
      if (imageElements.length > 0) {
        console.log('🔍 Image details:');
        imageElements.forEach((img, index) => {
          console.log(`  ${index + 1}. ${img.content.substring(0, 80)}...`);
          console.log(`     Type: ${img.content.startsWith('data:') ? 'Data URL' : img.content.startsWith('http') ? 'External URL' : 'Other'}`);
        });
      }
      
      console.log('📝 Total text elements:', result.elements.filter(el => el.type !== 'image').length);
      
    } catch (error) {
      console.error('❌ Error parsing HTML:', error);
    }

    return result;
  };

  const convertFilesToDataUrls = useCallback(async (files: File[]): Promise<Array<{ src: string; data: any }>> => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    const imagePromises = imageFiles.map(async (file) => {
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
      
      return {
        src: dataUrl,
        data: {
          alt: file.name,
          title: file.name
        }
      };
    });

    return Promise.all(imagePromises);
  }, []);

  const createBlockWithType = useCallback((content: string, blockType: string, currentEditorState: EditorState): EditorState => {
    console.log(`🔧 Creating block type: ${blockType} with content:`, content.substring(0, 50) + '...');
    
    // Создаем новый блок
    const newBlock = new ContentBlock({
      key: genKey(),
      type: 'unstyled', // Сначала создаем как обычный текст
      text: content,
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
    });
    
    // Добавляем блок в редактор
    const contentState = currentEditorState.getCurrentContent();
    const blockMap = contentState.getBlockMap();
    const newBlockMap = blockMap.set(newBlock.getKey(), newBlock);
    
    let newEditorState = EditorState.push(
      currentEditorState, 
      ContentState.createFromBlockArray(newBlockMap.toArray()), 
      'insert-fragment'
    );
    
    // Устанавливаем курсор на новый блок
    const newSelection = newEditorState.getSelection().merge({
      focusKey: newBlock.getKey(),
      anchorKey: newBlock.getKey(),
      focusOffset: 0,
      anchorOffset: 0,
    });
    
    newEditorState = EditorState.forceSelection(newEditorState, newSelection);
    
    // Теперь применяем нужный тип блока
    if (blockType !== BlockType.Text) {
      newEditorState = toggleBlockType(newEditorState, blockType, newBlock);
    }
    
    return newEditorState;
  }, [toggleBlockType]);

  const insertMixedContent = useCallback((content: ProcessedContent, currentEditorState: EditorState) => {
    let newEditorState = currentEditorState;
    
    console.log('🔧 Inserting mixed content with', content.elements.length, 'elements');
    console.log('🖼️ Images to insert:', content.elements.filter(el => el.type === 'image').length);
    console.log('📝 Text elements to insert:', content.elements.filter(el => el.type !== 'image').length);
    console.log('📋 Element sequence:', content.elements.map(el => el.type).join(' → '));
    
    content.elements.forEach((element, index) => {
      switch (element.type) {
        case 'paragraph':
          // ARCHITECTURAL FIX: Always create new blocks for consistent structure
          newEditorState = createBlockWithType(element.content, BlockType.Text, newEditorState);
          break;
          
        case 'heading1':
          newEditorState = createBlockWithType(element.content, BlockType.Heading1, newEditorState);
          break;
          
        case 'heading2':
          newEditorState = createBlockWithType(element.content, BlockType.Heading2, newEditorState);
          break;
          
        case 'heading3':
          newEditorState = createBlockWithType(element.content, BlockType.Heading3, newEditorState);
          break;
          
        case 'numbered-list':
          // CORRECT: Each element is already individual list item
          newEditorState = createBlockWithType(element.content, BlockType.NumberedList, newEditorState);
          break;
          
        case 'bullet-list':
          // CORRECT: Each element is already individual list item  
          newEditorState = createBlockWithType(element.content, BlockType.BulletList, newEditorState);
          break;
          
        case 'table':
          // Пока таблицы вставляем как обычный текст с пометкой
          newEditorState = createBlockWithType(element.content, BlockType.Text, newEditorState);
          break;
          
        case 'image':
          if (element.content) {
            console.log('🖼️ Inserting image:', element.content.substring(0, 50) + '...');
            console.log('🔍 Image source type:', element.content.startsWith('data:') ? 'Data URL' : 'External URL');
            
            // АРХИТЕКТУРНОЕ ИСПРАВЛЕНИЕ: Обработка разных типов изображений
            try {
              const prevBlockCount = newEditorState.getCurrentContent().getBlockMap().size;
              console.log('📊 Blocks before image insertion:', prevBlockCount);
              
              if (element.content.startsWith('data:')) {
                // Data URL - вставляем напрямую
                console.log('✅ Processing data URL image directly');
                newEditorState = addImage(newEditorState, element.content, element.data || {});
              } else if (element.content.startsWith('http') || element.content.startsWith('//')) {
                // Внешний URL - пока вставляем как есть (в будущем можно добавить загрузку на сервер)
                console.log('⚠️ Processing external URL image:', element.content);
                newEditorState = addImage(newEditorState, element.content, element.data || {});
              } else {
                // Относительный URL или другой формат
                console.log('🔄 Processing relative/unknown URL image:', element.content);
                newEditorState = addImage(newEditorState, element.content, element.data || {});
              }
              
              const newBlockCount = newEditorState.getCurrentContent().getBlockMap().size;
              console.log('📊 Blocks after image insertion:', newBlockCount);
              
              if (newBlockCount > prevBlockCount) {
                console.log('✅ Image insertion result: SUCCESS - Block added');
              } else {
                console.log('❌ Image insertion FAILED - No block added');
                console.log('🔄 Trying fallback: Insert as text description');
                
                // FALLBACK: Вставляем как текст если addImage не сработал
                const imageDescription = `[Изображение: ${element.data?.alt || 'Image'} - ${element.content}]`;
                newEditorState = createBlockWithType(imageDescription, BlockType.Text, newEditorState);
                console.log('✅ Fallback: Inserted image as text description');
              }
              
            } catch (error) {
              console.error('❌ Error inserting image:', error);
              console.error('📄 Image data:', { content: element.content, data: element.data });
            }
          }
          break;
          
        default:
          console.warn('⚠️ Unknown element type:', element.type);
          if (element.content) {
            newEditorState = createBlockWithType(element.content, BlockType.Text, newEditorState);
          }
      }
    });

    return newEditorState;
  }, [createBlockWithType]);

  const handlePastedFiles = useCallback((files: File[]): 'handled' | 'not-handled' => {
    console.log('📎 handlePastedFiles called with:', files.length, 'files');
    
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      console.log('🖼️ Processing', imageFiles.length, 'image files through handlePastedFiles');
      
      // Обрабатываем изображения
      convertFilesToDataUrls(imageFiles).then(images => {
        const content: ProcessedContent = {
          hasImages: true,
          elements: images.map(img => ({
            type: 'image' as const,
            content: img.src,
            data: img.data
          }))
        };

        setEditorState((currentState: EditorState) => 
          insertMixedContent(content, currentState)
        );
      });

      return 'handled';
    }

    return 'not-handled';
  }, [convertFilesToDataUrls, insertMixedContent, setEditorState]);

  const handlePastedText = useCallback((text: string, html?: string): 'handled' | 'not-handled' => {
    console.log('📝 handlePastedText called');
    console.log('Text length:', text.length);
    console.log('HTML length:', html?.length || 0);
    
    if (html) {
      // Детальная проверка содержимого
      const hasImages = html.includes('<img');
      const hasHeadings = html.includes('<h1') || html.includes('<h2') || html.includes('<h3');
      const hasLists = html.includes('<ol') || html.includes('<ul');
      const hasTables = html.includes('<table');
      
      console.log('🔍 Content analysis:', {
        hasImages,
        hasHeadings,
        hasLists,
        hasTables
      });
      
      // Если есть любой структурированный контент, обрабатываем сами
      if (hasImages || hasHeadings || hasLists || hasTables) {
        console.log('🎯 Found structured content, processing with custom handler');
        
        const parsedContent = parseHtmlContent(html);
        
        console.log('📊 Parsed content analysis:', {
          totalElements: parsedContent.elements.length,
          hasImages: parsedContent.hasImages,
          elementTypes: parsedContent.elements.map(el => el.type),
          imageElements: parsedContent.elements.filter(el => el.type === 'image').length
        });
        
        // Если есть изображения ИЛИ структурные элементы - обрабатываем сами
        if (parsedContent.hasImages || parsedContent.elements.some(el => el.type !== 'paragraph')) {
          console.log('✅ Processing structured content, preventing default DraftJS paste');
          
          // Асинхронно обрабатываем контент чтобы не блокировать UI
          setTimeout(() => {
            setEditorState((currentState: EditorState) => 
              insertMixedContent(parsedContent, currentState)
            );
          }, 0);

          return 'handled'; // Полностью обрабатываем paste сами
        } else {
          console.log('⚠️ Structured content detected but no elements parsed, fallback to default');
          
          // Fallback: если HTML содержит изображения но парсинг не сработал
          if (hasImages) {
            console.log('🔧 Attempting fallback image extraction');
            
            // Простое извлечение изображений как fallback
            const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/gi;
            let match;
            const fallbackImages = [];
            
            while ((match = imgRegex.exec(html)) !== null) {
              fallbackImages.push(match[1]);
            }
            
            if (fallbackImages.length > 0) {
              console.log('🖼️ Fallback found images:', fallbackImages.length);
              
              // Также извлекаем текст без HTML тегов
              const textContent = html.replace(/<[^>]*>/g, '').trim();
              console.log('📝 Fallback extracted text length:', textContent.length);
              
              const fallbackElements = [];
              
              // Добавляем текст если есть
              if (textContent) {
                fallbackElements.push({
                  type: 'paragraph' as const,
                  content: textContent
                });
              }
              
              // Добавляем изображения
              fallbackImages.forEach(src => {
                fallbackElements.push({
                  type: 'image' as const,
                  content: src,
                  data: {
                    alt: 'Изображение из Google Docs',
                    title: 'Изображение из Google Docs'
                  }
                });
              });
              
              const fallbackContent: ProcessedContent = {
                hasImages: true,
                elements: fallbackElements
              };
              
              console.log('🔄 Fallback content elements:', fallbackContent.elements.map(el => el.type));
              
              setTimeout(() => {
                setEditorState((currentState: EditorState) => 
                  insertMixedContent(fallbackContent, currentState)
                );
              }, 0);
              
              return 'handled';
            }
          }
        }
      }
    }
    
    console.log('📝 No structured content found, letting DraftJS handle text paste');
    return 'not-handled'; // Позволяем DraftJS обработать обычный текст
  }, [parseHtmlContent, insertMixedContent, setEditorState]);

  // Убираем глобальный обработчик paste чтобы избежать дублирования
  // Всю логику сосредотачиваем в DraftJS обработчиках
  const handleCustomPaste = useCallback((event: ClipboardEvent) => {
    // Этот обработчик теперь только для дебаггинга
    console.log('🔍 Custom paste event triggered (debug only)');
    console.log('📋 Clipboard data types:', Array.from(event.clipboardData?.types || []));
  }, []);

  return {
    handlePastedFiles,
    handlePastedText,
    handleCustomPaste
  };
}; 
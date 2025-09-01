import { useState } from 'react';
import { Unit } from '@entities/models/unit';
import { ReactComponent as DownloadIcon } from '@images/icons/download.svg';
import ActiveButton from '@shared/uikit/active-button';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { successToastOptions, errorToastOptions, darkToastOptions } from '@shared/common/Toast';

interface DownloadPDFButtonProps {
  unit: Unit;
  callback?: () => void;
}

/**
 * Browser detection utilities
 */
const isChrome = () => {
  return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
};

const isSafari = () => {
  return /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor) && !/Chrome/.test(navigator.userAgent);
};

/**
 * Clean filename to handle Cyrillic and special characters
 */
const cleanFilename = (name: string): string => {
  return name
    .replace(/[<>:"/\\|?*]/g, '') // Remove forbidden filename characters
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim()
    .substring(0, 50) || 'Document'; // Fallback if empty after cleaning
};

/**
 * Get document name with comprehensive fallbacks - prioritize first heading
 */
const getDocumentName = (unit: Unit): string => {
  const getFirstHeading = () => {
    // Try to get first heading from Draft.js content
    const draftBlocks = document.querySelectorAll('.public-DraftStyleDefault-block');
    for (const block of draftBlocks) {
      const text = block.textContent?.trim();
      if (text && text.length > 0 && text.length < 100) { // Reasonable title length
        return text;
      }
    }
    
    // Try to get from Draft editor root - first line
    const draftRoot = document.querySelector('.DraftEditor-root');
    if (draftRoot) {
      const firstLine = draftRoot.textContent?.split('\n')[0]?.trim();
      if (firstLine && firstLine.length > 0 && firstLine.length < 100) {
        return firstLine;
      }
    }
    
  return null;
  };
  
  const rawDocumentName = 
    unit.name ||
    getFirstHeading() ||
    document.querySelector('.dokably-title-block')?.textContent?.trim() ||
    document.querySelector('[data-block-type="title"]')?.textContent?.trim() ||
    document.querySelector('.document-title')?.textContent?.trim() ||
    document.querySelector('.cover-title')?.textContent?.trim() ||
    document.querySelector('h1')?.textContent?.trim() ||
    document.querySelector('h2')?.textContent?.trim() ||
    document.title || 
    'Untitled Document';
    
  return cleanFilename(rawDocumentName);
};

/**
 * Chrome-specific PDF generation using print window
 */
const generatePDFForChrome = async (fileName: string): Promise<void> => {
  try {
    // Find the main document container (broader search for complete content)
    let documentContainer =
      document.querySelector('.document-details') ||  // Full document with cover
      document.querySelector('main') ||              // Main content area (includes task boards)
      document.querySelector('.DraftEditor-root') ||
      document.querySelector('[data-contents="true"]') ||
      document.querySelector('.dokably-editor') ||
      document.body;

    if (!documentContainer) {
      throw new Error('Could not find document content');
    }

    // Clone the entire container to preserve structure and styling
    const clonedContainer = documentContainer.cloneNode(true) as HTMLElement;
    
    // Remove interactive elements and problematic attributes
    const elementsToRemove = clonedContainer.querySelectorAll(`
      .tooltip, .popover, .dropdown-content, .context-menu,
      .floating-ui, .drag-overlay, .sortable-ghost, 
      [data-floating-ui], [data-tooltip], [role="tooltip"],
      button[aria-label*="close"], button[aria-label*="menu"], 
      button[aria-label*="more"], button[aria-label*="delete"], 
      button[aria-label*="edit"]
    `);
    
    elementsToRemove.forEach(el => el.remove());
    
    // Remove drag and drop attributes
    const draggableElements = clonedContainer.querySelectorAll('[draggable], [data-dnd-kit-draggable-id], [data-sortable-id]');
    draggableElements.forEach(el => {
      el.removeAttribute('draggable');
      el.removeAttribute('data-dnd-kit-draggable-id');
      el.removeAttribute('data-sortable-id');
      el.removeAttribute('data-dnd-kit');
    });

    // Collect all stylesheets from the current page
    const styleSheets: string[] = [];
    
    // Collect inline styles
    Array.from(document.styleSheets).forEach(sheet => {
      try {
        // Only process same-origin stylesheets
        if (sheet.href && !sheet.href.startsWith(window.location.origin)) {
        return;
        }
        
        const rules = Array.from(sheet.cssRules || sheet.rules || []);
        const cssText = rules.map(rule => rule.cssText).join('\n');
        if (cssText) {
          styleSheets.push(cssText);
        }
      } catch (e) {
        // Ignore CORS errors for external stylesheets
      }
    });
    
    // Collect inline styles from style tags
    Array.from(document.querySelectorAll('style')).forEach(style => {
      if (style.textContent) {
        styleSheets.push(style.textContent);
      }
    });

    // Create complete HTML with preserved styles
    const completeHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${fileName}</title>
        <style>
          /* Preserve original styles */
          ${styleSheets.join('\n')}
          
          /* Minimal print-specific fixes only */
          @media print, screen {
            /* Basic print setup */
            body {
              background: white !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              margin: 0 !important;
              padding: 20px 20px 20px 200px !important;
            }
            
            /* Hide only problematic elements */
            .tooltip, .popover, .dropdown-content, .context-menu,
            .floating-ui, .drag-overlay, .sortable-ghost,
            [data-floating-ui], [data-tooltip], [role="tooltip"] {
              display: none !important;
            }
            
            /* Basic print optimizations */
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            /* Fix overflow issues */
            .overflow-hidden, .overflow-x-auto, .overflow-y-auto {
              overflow: visible !important;
            }
            
            .max-h-screen, .max-h-full, [class*="max-h-"] {
              max-height: none !important;
            }
            
            .min-h-screen, .min-h-full, [class*="min-h-"] {
              min-height: auto !important;
            }
            
            /* Image optimizations */
            img {
              max-width: 100% !important;
              height: auto !important;
              page-break-inside: avoid;
            }
            
            /* Block-level elements that should avoid breaking */
            .task-board, .kanban, .list-view, .table-view, 
            .editable-table, .embed, .image-block {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            
            /* Fix scrollable containers */
            .scrollable, [class*="scroll"] {
              overflow: visible !important;
              max-height: none !important;
            }
          }
        </style>
      </head>
      <body>
        ${clonedContainer.outerHTML}
      </body>
      </html>
    `;

    // Open window with the complete styled document and download button
    const printWindow = window.open('', '_blank', 'width=800,height=900,scrollbars=yes,resizable=yes');
    if (!printWindow) {
      throw new Error('Could not open print window');
    }

    printWindow.document.write(completeHTML);
    printWindow.document.close();

    // Trigger print dialog automatically
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 1000);
    };

  } catch (error) {
    console.error('Chrome PDF generation failed:', error);
    throw error;
  }
};

/**
 * Safari-specific PDF generation with download button
 */
const generatePDFForSafari = async (fileName: string): Promise<void> => {
  try {
    // Find the main document container
    let documentContainer =
      document.querySelector('.document-details') ||
      document.querySelector('main') ||
      document.querySelector('.DraftEditor-root') ||
      document.querySelector('[data-contents="true"]') ||
      document.querySelector('.dokably-editor') ||
      document.body;

    if (!documentContainer) {
      throw new Error('Could not find document content');
    }

    // Clone the entire container
    const clonedContainer = documentContainer.cloneNode(true) as HTMLElement;
    
    // Remove interactive elements
    const elementsToRemove = clonedContainer.querySelectorAll(`
      .tooltip, .popover, .dropdown-content, .context-menu,
      .floating-ui, .drag-overlay, .sortable-ghost, 
      [data-floating-ui], [data-tooltip], [role="tooltip"],
      button[aria-label*="close"], button[aria-label*="menu"], 
      button[aria-label*="more"], button[aria-label*="delete"], 
      button[aria-label*="edit"]
    `);
    
    elementsToRemove.forEach(el => el.remove());

    // Collect all stylesheets
    const styleSheets: string[] = [];
    
    Array.from(document.styleSheets).forEach(sheet => {
      try {
        if (sheet.href && !sheet.href.startsWith(window.location.origin)) {
          return;
        }
        
        const rules = Array.from(sheet.cssRules || sheet.rules || []);
        const cssText = rules.map(rule => rule.cssText).join('\\n');
        if (cssText) {
          styleSheets.push(cssText);
        }
      } catch (e) {
        // Ignore CORS errors
      }
    });
    
    Array.from(document.querySelectorAll('style')).forEach(style => {
      if (style.textContent) {
        styleSheets.push(style.textContent);
      }
    });

    // Create complete HTML with download button for Safari
    const completeHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${fileName}</title>
        <style>
          ${styleSheets.join('\n')}
          
          @media print, screen {
            body {
              background: white !important;
              margin: 0 !important;
              padding: 20px 20px 50px 100px !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              transform: scale(1.5) !important;
              transform-origin: top left !important;
              width: 66.67% !important; /* Compensate for 1.5x scale */
            }
            
            .tooltip, .popover, .dropdown-content, .context-menu,
            .floating-ui, .drag-overlay, .sortable-ghost,
            [data-floating-ui], [data-tooltip], [role="tooltip"] {
              display: none !important;
            }
            
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        </style>
      </head>
      <body>
        <div style="position: fixed; top: 20px; right: 20px; z-index: 9999; background: #007bff; color: white; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);" onclick="downloadAsPDF(); return false;">
          📄 Download as PDF
        </div>
        ${clonedContainer.outerHTML}
        
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
        <script>
          async function downloadAsPDF() {
            try {
              const btn = document.querySelector('div[onclick*="downloadAsPDF"]');
              const originalDisplay = btn.style.display;
              btn.style.display = 'none';
              
              await new Promise(resolve => setTimeout(resolve, 100));
              
              const canvas = await html2canvas(document.body, {
                scale: 1.5,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                foreignObjectRendering: true,
              });
              
              btn.style.display = originalDisplay;
              
              const { jsPDF } = window.jspdf;
              const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
              });
              
              const imgData = canvas.toDataURL('image/png');
              const pdfWidth = pdf.internal.pageSize.getWidth();
              const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
              
              pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
              pdf.save('${fileName}.pdf');
              
      } catch (error) {
              console.error('PDF generation failed:', error);
              alert('Failed to generate PDF. Please try again.');
            }
          }
          
          document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
              e.preventDefault();
              downloadAsPDF();
            }
          });
        </script>
      </body>
      </html>
    `;

    // Open window with download button
    const printWindow = window.open('', '_blank', 'width=800,height=900,scrollbars=yes,resizable=yes');
    if (!printWindow) {
      throw new Error('Could not open print window');
    }

    printWindow.document.write(completeHTML);
    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
      }, 500);
    };

  } catch (error) {
    console.error('Safari PDF generation failed:', error);
    throw error;
  }
};

/**
 * Safari and other browsers - capture actual rendered content from DOM and generate PDF
 * Based on original implementation from master branch
 */
const captureAndGeneratePDF = async (fileName: string): Promise<void> => {
  try {
    // Find the document content container with multiple fallbacks
    let documentContainer = 
      // Primary Dokably editor selectors
      document.querySelector('.DraftEditor-root') ||
      document.querySelector('[data-contents="true"]') ||
      document.querySelector('.public-DraftEditor-content') ||
      document.querySelector('.dokably-editor') ||
      
      // Document layout selectors (to include cover image + content)
      document.querySelector('.document-details') ||
      document.querySelector('[data-testid="document-content"]') ||
      document.querySelector('.document-content') ||
      
      // Editor and content areas
      document.querySelector('.editor-content') ||
      document.querySelector('[role="textbox"]') ||
      document.querySelector('main') ||
      
      // Task board and other content
      document.querySelector('.task-board') ||
      document.querySelector('.list-table') ||
      document.querySelector('.kanban-board') ||
      
      // Fallback to main content area
      document.querySelector('.main-content') ||
      
      // Last resort - substantial content
      Array.from(document.querySelectorAll('div')).find(el => 
        el.textContent && el.textContent.trim().length > 100
      ) ||
      document.body;

    // If we found body or a generic div, try to be more specific
    if (documentContainer === document.body || documentContainer?.tagName === 'DIV') {
      const betterContainer = 
        document.querySelector('[data-testid*="editor"]') ||
        document.querySelector('[class*="editor"]') ||
        Array.from(document.querySelectorAll('div')).find(el => 
          el.textContent && el.textContent.trim().length > 100
        );
      
      if (betterContainer) {
        documentContainer = betterContainer;
      }
    }

    if (!documentContainer) {
      throw new Error('Could not find document content');
    }
    
    // Clone the container to avoid modifying the original
    const clonedContainer = documentContainer.cloneNode(true) as HTMLElement;
    
    // Remove problematic elements that could cause rendering issues
    const elementsToRemove = clonedContainer.querySelectorAll(`
      .tooltip, .popover, .dropdown-content, .context-menu,
      .floating-ui, .drag-overlay, .sortable-ghost, 
      [data-floating-ui], [data-tooltip], [role="tooltip"],
      button[title*="close"], button[title*="menu"], 
      .sidebar, .comments-panel
    `);
    
    elementsToRemove.forEach(el => el.remove());

    // Temporarily add to document for canvas capture (positioning off-screen)
    clonedContainer.style.position = 'absolute';
    clonedContainer.style.left = '-9999px';
    clonedContainer.style.top = '0';
    clonedContainer.style.width = '210mm'; // A4 width
    clonedContainer.style.backgroundColor = 'white';
    clonedContainer.style.padding = '20px 20px 20px 200px'; // 200px left margin for Safari
    clonedContainer.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    clonedContainer.style.fontSize = '14px';
    clonedContainer.style.lineHeight = '1.6';
    clonedContainer.style.color = '#333';
    
    // Very minimal Safari fixes - only what's absolutely necessary
    // Force a clean layout context
    clonedContainer.style.display = 'block';
    clonedContainer.style.position = 'static';
    clonedContainer.style.transform = 'none';
    
    // Allow enough time for layout to settle
    await new Promise(resolve => setTimeout(resolve, 100));
    
    document.body.appendChild(clonedContainer);

    // Small delay to ensure proper rendering
    await new Promise(resolve => setTimeout(resolve, 500));

    // Back to simpler canvas capture - closer to original working version
    const canvas = await html2canvas(clonedContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      foreignObjectRendering: true,
      logging: false,
      removeContainer: true,
    });

    // Remove the temporary element
    document.body.removeChild(clonedContainer);

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    // PDF dimensions
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pdfWidth - (2 * margin);

    // Convert canvas to image data
    const imgData = canvas.toDataURL('image/png', 0.95);
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Handle single or multi-page content
    if (imgHeight <= pdfHeight - (2 * margin)) {
      // Single page
      pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
    } else {
      // Multi-page content
      const pageHeight = pdfHeight - (2 * margin);
      const pages = Math.ceil(imgHeight / pageHeight);
      
      for (let page = 0; page < pages; page++) {
        if (page > 0) {
          pdf.addPage();
        }
        
        const sourceY = page * pageHeight * (canvas.height / imgHeight);
        const sourceHeight = Math.min(pageHeight * (canvas.height / imgHeight), canvas.height - sourceY);
        const displayHeight = (sourceHeight / canvas.height) * imgHeight;
        
        // Create page slice
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceHeight;
        const pageCtx = pageCanvas.getContext('2d');
        
        if (pageCtx) {
          pageCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
          const pageImgData = pageCanvas.toDataURL('image/png', 0.95);
          pdf.addImage(pageImgData, 'PNG', margin, margin, imgWidth, displayHeight);
        }
      }
    }

    // Download with clean filename
    const cleanFileName = cleanFilename(fileName);
    pdf.save(`${cleanFileName}.pdf`);

  } catch (error) {
    console.error('PDF generation failed:', error);
    throw error;
  }
};

const DownloadPDFButton = ({ unit, callback }: DownloadPDFButtonProps) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (isDownloading) return; // Prevent multiple simultaneous generations
    
    setIsDownloading(true);
    
    // Get document name with comprehensive fallbacks
    const documentName = getDocumentName(unit);
    
    // Show loading toast
    const loadingToast = toast(
      'Generating PDF... Please do not close this page. This may take a few moments.',
      {
        ...darkToastOptions,
        icon: '⏳',
        duration: Infinity, // Don't auto-dismiss
        style: {
          ...darkToastOptions.style,
          maxWidth: '420px',
        }
      }
    );
    
    try {
      // Check browser type and use appropriate method
      if (isChrome()) {
        // Chrome: Use print dialog method
        await generatePDFForChrome(documentName);
      toast.dismiss(loadingToast);
        toast.success('Chrome: Print dialog opened. Use "Save as PDF" option', successToastOptions);
      callback?.();
        return;
      } else if (isSafari()) {
        // Safari: Use special method with download button
        await generatePDFForSafari(documentName);
        toast.dismiss(loadingToast);
        toast.success('Safari: New window opened. Click the blue button to download PDF', successToastOptions);
        callback?.();
        return;
        } else {
        // Other browsers: Use html2canvas method with auto-download
        await captureAndGeneratePDF(documentName);
        toast.dismiss(loadingToast);
        toast.success('PDF generated successfully!', successToastOptions);
        callback?.();
        return;
      }
        
    } catch (error: any) {
      console.error('PDF generation failed:', error);
        toast.dismiss(loadingToast);
      
      const errorMessage = error?.message || 'Failed to generate PDF';
      toast.error(`PDF generation failed: ${errorMessage}`, errorToastOptions);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <ActiveButton 
      className='action'
      onClick={handleDownloadPDF}
      disabled={isDownloading}
      leftSection={<DownloadIcon />}
    >
      {isDownloading ? 'Generating...' : 'Download as PDF'}
    </ActiveButton>
  );
};

export default DownloadPDFButton;

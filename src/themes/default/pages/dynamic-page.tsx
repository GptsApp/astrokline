import { Suspense } from 'react';
import { getThemeBlock } from '@/core/theme';
import type { DynamicPage as DynamicPageType } from '@/shared/types/blocks/landing';

async function AsyncBlockWrapper({ block, section, data }: any) {
  try {
    if (section.component) {
      return section.component;
    }

    const DynamicBlock = await getThemeBlock(block);
    return (
      <DynamicBlock
        section={section}
        {...(data || section.data || {})}
      />
    );
  } catch (error) {
    return null;
  }
}

export default async function DynamicPage({
  locale,
  page,
  data,
}: {
  locale?: string;
  page: DynamicPageType;
  data?: Record<string, any>;
}) {
  return (
    <>
      {page.title && !page.sections?.hero && (
        <h1 className="sr-only">{page.title}</h1>
      )}
      {page?.sections &&
        (page.show_sections || Object.keys(page.sections)).map(
          (sectionKey: string, index: number) => {
            const section = page.sections?.[sectionKey];
            if (!section || section.disabled === true) {
              return null;
            }

            // block name
            const block = section.block || section.id || sectionKey;

            if (index === 0) {
              // Priority blocking for the First Contentful Paint.
              return (
                <AsyncBlockWrapper 
                  key={sectionKey} 
                  block={block} 
                  section={section} 
                  data={data} 
                />
              );
            }

            // Progressive streaming for below the fold elements.
            return (
              <Suspense 
                key={sectionKey} 
                fallback={<div className="opacity-0 min-h-[5vh]" aria-hidden="true" />}
              >
                <AsyncBlockWrapper 
                  block={block} 
                  section={section} 
                  data={data} 
                />
              </Suspense>
            );
          }
        )}
    </>
  );
}

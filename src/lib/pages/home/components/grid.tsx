import React, { useEffect, useRef, useState } from 'react';
import { renderToString } from 'react-dom/server';
import ApexCharts, { ApexOptions } from 'apexcharts';
import { GridStack, GridStackNode } from 'gridstack';
import 'gridstack/dist/gridstack.min.css';
import { Card } from '@chakra-ui/react';

interface GridItemData {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  content: string;
  chartOptions: ApexOptions;
  backgroundColor: string;
}

interface GridstackGridProps {
  initialItems: GridItemData[];
  minCellHeight: number;
  minCellWidth: number;
  isLocked: boolean;
}

const GridstackGrid: React.FC<GridstackGridProps> = ({
  initialItems,
  isLocked,
  minCellHeight,
  minCellWidth,
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [grid, setGrid] = useState<GridStack | null>(null);
  const chartsRef = useRef<{ [key: string]: ApexCharts }>({});

  const createOrUpdateChart = (itemId: string) => {
    const options = initialItems.find((p) => p.id === itemId)?.chartOptions;
    if (!options) return;
    options.chart = options.chart ? options.chart : {};
    const chartElement = document.querySelector(
      `#content-chart-wrapper-${itemId}`
    ) as HTMLElement;
    if (!chartElement) return;

    const gridItem = chartElement.closest('.grid-stack-item') as HTMLElement;
    if (!gridItem) return;

    const contentElement = gridItem.querySelector(
      '.grid-stack-item-content'
    ) as HTMLElement;
    if (!contentElement) return;

    const padding = 20; // Adjust this value based on your padding
    const titleHeight = 30; // Adjust this value based on your title height
    const width = contentElement.clientWidth - padding * 2;
    const height = contentElement.clientHeight - padding * 2 - titleHeight;
    options.chart!.width = width;
    options.chart!.height = height;

    if (chartsRef.current[itemId]) {
      chartsRef.current[itemId].updateOptions(options);
    } else {
      const chart = new ApexCharts(chartElement, options);
      chart.render();
      chartsRef.current[itemId] = chart;
    }
  };

  useEffect(() => {
    if (!gridRef.current) return;
    const gridInstance = GridStack.init(
      {
        column: 12,
        cellHeight: 80,
        animate: true,
        float: false,
        staticGrid: false,
      },
      gridRef.current
    );
    setGrid(gridInstance);
    return () => {
      if (gridInstance) {
        gridInstance.destroy(false);
      }
    };
  }, []);

  useEffect(() => {
    if (!grid) return;
    grid.removeAll(false);
    const minWidth = minCellWidth;
    const minHeight = minCellHeight;

    const sortedItems = [...initialItems].sort((a, b) => a.y - b.y);

    sortedItems.forEach((item) => {
      const node: GridStackNode = {
        id: item.id,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
        minW: minWidth,
        minH: minHeight,
        content: renderToString(
          <Card
            id={`content-id-${item.id}`}
            style={{
              padding: 10,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              id={`content-chart-wrapper-${item.id}`}
              style={{ flexGrow: 1 }}
            />
          </Card>
        ),
      };
      grid.addWidget(node);
    });
    grid.compact();
    sortedItems.forEach((item) => createOrUpdateChart(item.id));

    return () => {
      Object.values(chartsRef.current).forEach((chart) => chart.destroy());
      chartsRef.current = {};
    };
  }, [initialItems, grid]);

  useEffect(() => {
    if (!grid) return;
    grid.setStatic(isLocked);
  }, [isLocked]);

  useEffect(() => {
    if (!grid) return;
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const gridItem = entry.target.closest(
          '.grid-stack-item'
        ) as HTMLElement;
        if (gridItem) {
          const itemId = gridItem.getAttribute('gs-id');
          if (itemId) {
            createOrUpdateChart(itemId);
          }
        }
      });
    });

    const onResizeStop = (_: Event, element: HTMLElement) => {
      const chartId = element.getAttribute('gs-id');
      if (chartId) {
        createOrUpdateChart(chartId);
      }
      grid.compact();
    };

    grid.on('resizestop', onResizeStop);
    grid.on('dragstop', () => {
      grid.compact();
      Object.keys(chartsRef.current).forEach(createOrUpdateChart);
    });

    document.querySelectorAll('.grid-stack-item-content').forEach((item) => {
      resizeObserver.observe(item);
    });

    return () => {
      resizeObserver.disconnect();
      grid.off('resizestop');
      grid.off('dragstop');
    };
  }, [grid]);

  return <div className="grid-stack" ref={gridRef}></div>;
};

export default GridstackGrid;

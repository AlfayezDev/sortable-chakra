import React, { useEffect, useRef, useState } from 'react';
import { renderToString } from 'react-dom/server';
import ApexCharts from 'apexcharts';
import { GridStack, GridStackNode } from 'gridstack';
import 'gridstack/dist/gridstack.min.css';

interface GridItemData {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  content: string;
  backgroundColor: string;
}

interface GridstackGridProps {
  initialItems: GridItemData[];
  isLocked: boolean;
}

const GridstackGrid: React.FC<GridstackGridProps> = ({
  initialItems,
  isLocked,
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [grid, setGrid] = useState<GridStack | null>(null);
  const chartsRef = useRef<{ [key: string]: ApexCharts }>({});

  const createOrUpdateChart = (itemId: string) => {
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

    const chartOptions = {
      chart: {
        type: 'line' as const,
        width: width,
        height: height,
        animations: {
          enabled: false,
        },
      },
      series: [
        {
          name: 'sales',
          data: [30, 40, 35, 50, 49, 60, 70, 91, 125],
        },
      ],
      xaxis: {
        categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999],
      },
      responsive: [
        {
          breakpoint: 300,
          options: {
            chart: {
              width: '100%',
            },
          },
        },
      ],
    };

    if (chartsRef.current[itemId]) {
      chartsRef.current[itemId].updateOptions(chartOptions);
    } else {
      const chart = new ApexCharts(chartElement, chartOptions);
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
        disableOneColumnMode: true,
        staticGrid: isLocked,
      },
      gridRef.current
    );
    setGrid(gridInstance);
    return () => {
      if (gridInstance) {
        gridInstance.destroy(false);
      }
    };
  }, [isLocked]);

  useEffect(() => {
    if (!grid) return;
    grid.removeAll(false);
    const element5 = initialItems.find((item) => item.id === '5');
    const minWidth = element5 ? element5.w : 1;
    const minHeight = element5 ? element5.h : 1;

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
          <div
            id={`content-id-${item.id}`}
            style={{
              padding: 10,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <p style={{ marginBottom: '10px' }}>{item.id}</p>
            <div
              id={`content-chart-wrapper-${item.id}`}
              style={{ flexGrow: 1 }}
            />
          </div>
        ),
      };
      grid.addWidget(node);
    });

    grid.compact();

    // Delay chart creation to ensure grid items have settled
    setTimeout(() => {
      sortedItems.forEach((item) => createOrUpdateChart(item.id));
    }, 100);

    return () => {
      Object.values(chartsRef.current).forEach((chart) => chart.destroy());
      chartsRef.current = {};
    };
  }, [initialItems, grid]);

  useEffect(() => {
    if (!grid) return;
    grid.enableMove(!isLocked);
    grid.enableResize(!isLocked);
    grid.setStatic(isLocked);
  }, [isLocked, grid]);

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

    const onResizeStop = (event: Event, element: HTMLElement) => {
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

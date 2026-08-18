import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';

import { StepsWidget } from './StepsWidget';
import { loadWidgetData } from './widget-data';

const nameToWidget = {
  StepsWidget,
};

/**
 * Headless handler invoked by Android when a widget is added, updated
 * (periodic), resized or clicked. It reads the last persisted snapshot and
 * renders the widget. Runs in a separate JS context from the app UI.
 */
export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const widgetName = props.widgetInfo.widgetName as keyof typeof nameToWidget;
  const Widget = nameToWidget[widgetName] || StepsWidget;

  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
    case 'WIDGET_CLICK': {
      const data = await loadWidgetData();
      props.renderWidget(<Widget steps={data.steps} goal={data.goal} />);
      break;
    }
    case 'WIDGET_DELETED':
    default:
      break;
  }
}

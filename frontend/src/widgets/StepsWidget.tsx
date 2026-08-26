import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export interface StepsWidgetData {
  steps: number;
  goal: number;
}

const ORANGE = '#FF7A00';
const BG = '#101010';
const TRACK = '#2A2A2A';
const WHITE = '#FFFFFF';
const GREY = '#B8B8B8';

export function StepsWidget({ steps, goal }: StepsWidgetData) {
  const safeGoal = goal > 0 ? goal : 1;
  const pct = Math.min(1, steps / safeGoal);
  const pctInt = Math.round(pct * 100);

  // Integer weights for Android RemoteViews (1 to 100)
  const fillWeight = Math.max(1, Math.round(pct * 100));
  const restWeight = Math.max(1, 100 - fillWeight);

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: BG,
        borderRadius: 20,
        padding: 16,
      }}
    >
      {/* Header */}
      <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: 'match_parent' }}>
        <TextWidget text="FitFlow" style={{ fontSize: 13, fontWeight: 'bold', color: ORANGE }} />
        <TextWidget text={`${pctInt}% Complete`} style={{ fontSize: 11, fontWeight: 'bold', color: ORANGE }} />
      </FlexWidget>

      {/* Steps */}
      <FlexWidget style={{ flexDirection: 'column', width: 'match_parent' }}>
        <TextWidget text={String(steps)} style={{ fontSize: 28, fontWeight: 'bold', color: WHITE }} />
        <TextWidget text="Steps today" style={{ fontSize: 12, color: GREY, marginTop: 2 }} />
      </FlexWidget>

      {/* Progress bar */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          height: 8,
          width: 'match_parent',
          backgroundColor: TRACK,
          borderRadius: 4,
          marginTop: 8,
        }}
      >
        <FlexWidget style={{ flex: fillWeight, height: 8, backgroundColor: ORANGE, borderRadius: 4 }} />
        <FlexWidget style={{ flex: restWeight, height: 8, backgroundColor: TRACK, borderRadius: 4 }} />
      </FlexWidget>

      {/* Goal */}
      <TextWidget text={`Goal: ${String(goal)}`} style={{ fontSize: 12, color: GREY, marginTop: 8 }} />
    </FlexWidget>
  );
}

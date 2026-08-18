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

/**
 * FitFlow home-screen widget.
 * Rendered natively by react-native-android-widget (no DOM / RN Views here —
 * only the library's FlexWidget / TextWidget primitives are allowed).
 * Tapping anywhere opens the app (clickAction OPEN_APP on the root).
 */
export function StepsWidget({ steps, goal }: StepsWidgetData) {
  const safeGoal = goal > 0 ? goal : 1;
  const pct = Math.min(1, steps / safeGoal);
  const pctInt = Math.round(pct * 100);
  // progress bar via flex proportions (avoid 0 which collapses layout)
  const fillFlex = Math.max(0.0001, pct);
  const restFlex = Math.max(0.0001, 1 - pct);

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
        <TextWidget text="FitFlow" style={{ fontSize: 13, fontWeight: '700', color: ORANGE }} />
        <TextWidget text={`${pctInt}% Complete`} style={{ fontSize: 11, fontWeight: '700', color: ORANGE }} />
      </FlexWidget>

      {/* Steps */}
      <FlexWidget style={{ flexDirection: 'column', width: 'match_parent' }}>
        <TextWidget text={steps.toLocaleString()} style={{ fontSize: 30, fontWeight: '900', color: WHITE }} />
        <TextWidget text="Steps today" style={{ fontSize: 12, color: GREY, marginTop: 2 }} />
      </FlexWidget>

      {/* Progress bar */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          height: 8,
          width: 'match_parent',
          backgroundColor: TRACK,
          borderRadius: 8,
          marginTop: 8,
        }}
      >
        <FlexWidget style={{ flex: fillFlex, height: 8, backgroundColor: ORANGE, borderRadius: 8 }} />
        <FlexWidget style={{ flex: restFlex, height: 8, backgroundColor: TRACK, borderRadius: 8 }} />
      </FlexWidget>

      {/* Goal */}
      <TextWidget text={`Goal: ${goal.toLocaleString()}`} style={{ fontSize: 12, color: GREY, marginTop: 8 }} />
    </FlexWidget>
  );
}

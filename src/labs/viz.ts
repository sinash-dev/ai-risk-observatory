import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import type { VizProps } from '../data/types';

/** Simulation components, loaded only when a model page needs them. */
export const VIZ: Record<string, LazyExoticComponent<ComponentType<VizProps>>> = {
  'salary': lazy(() => import('./classicalViz').then((m) => ({ default: m.SalaryViz }))),
  'credit': lazy(() => import('./classicalViz').then((m) => ({ default: m.CreditViz }))),
  'benefits': lazy(() => import('./classicalViz').then((m) => ({ default: m.TreeViz }))),
  'fraud': lazy(() => import('./classicalViz').then((m) => ({ default: m.FraudViz }))),
  'segments': lazy(() => import('./classicalViz').then((m) => ({ default: m.SegmentViz }))),
  'staffing': lazy(() => import('./classicalViz').then((m) => ({ default: m.StaffingViz }))),
  'lesion': lazy(() => import('./deepViz').then((m) => ({ default: m.LesionViz }))),
  'cv': lazy(() => import('./deepViz').then((m) => ({ default: m.CvViz }))),
  'feed': lazy(() => import('./deepViz').then((m) => ({ default: m.FeedViz }))),
  'pricing': lazy(() => import('./deepViz').then((m) => ({ default: m.PricingViz }))),
  'spam': lazy(() => import('./extraViz').then((m) => ({ default: m.SpamViz }))),
  'face': lazy(() => import('./extraViz').then((m) => ({ default: m.FaceViz }))),
  'emotion': lazy(() => import('./extraViz').then((m) => ({ default: m.EmotionViz }))),
  'foundation': lazy(() => import('./extraViz').then((m) => ({ default: m.FoundationViz }))),
  'chatbot': lazy(() => import('./genaiViz').then((m) => ({ default: m.ChatViz }))),
  'rag': lazy(() => import('./genaiViz').then((m) => ({ default: m.RagViz }))),
  'imagegen': lazy(() => import('./genaiViz').then((m) => ({ default: m.ImageGenViz }))),
  'code': lazy(() => import('./genaiViz').then((m) => ({ default: m.CodeViz }))),
  'travel-agent': lazy(() => import('./agenticViz').then((m) => ({ default: m.TravelAgentViz }))),
  'devops-agent': lazy(() => import('./agenticViz').then((m) => ({ default: m.DevopsAgentViz }))),
  'swarm': lazy(() => import('./agenticViz').then((m) => ({ default: m.SwarmViz }))),
};

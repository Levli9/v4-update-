import { aiApi } from './apiClient';

export async function generatePresentation(input) {
  const result = await aiApi.generateCourse(input);
  return {
    ...result,
    id: result.id || `deck-${Date.now()}`,
    mode: 'server-ai'
  };
}

export async function refineSlide(action, slide, topic) {
  return aiApi.refineSlide(action, slide, topic);
}

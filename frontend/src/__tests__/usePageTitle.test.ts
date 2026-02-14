/**
 * Unit test for usePageTitle hook.
 */

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePageTitle } from '../hooks/usePageTitle';

describe('usePageTitle', () => {
  it('should set document title with suffix', () => {
    renderHook(() => usePageTitle('Test Page'));
    expect(document.title).toBe('Test Page | NPC Empanelment Portal');
  });

  it('should update title when title changes', () => {
    const { rerender } = renderHook(({ title }) => usePageTitle(title), {
      initialProps: { title: 'First' },
    });

    expect(document.title).toBe('First | NPC Empanelment Portal');

    rerender({ title: 'Second' });
    expect(document.title).toBe('Second | NPC Empanelment Portal');
  });
});

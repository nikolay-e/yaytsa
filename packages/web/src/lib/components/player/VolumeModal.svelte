<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fly, fade } from 'svelte/transition';

  const dispatch = createEventDispatcher<{ change: number; close: void }>();

  export let volume: number = 1;

  let displayVolume = Math.round(volume * 100);

  $: displayVolume = Math.round(volume * 100);

  function handleVolumeChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const newVolume = parseFloat(target.value) / 100;
    dispatch('change', newVolume);
  }

  function handleClose() {
    dispatch('close');
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  }
</script>

<div
  class="volume-modal-backdrop"
  on:click={handleBackdropClick}
  on:keydown={(e) => e.key === 'Escape' && handleClose()}
  transition:fade={{ duration: 200 }}
  role="button"
  tabindex="0"
>
  <div class="volume-modal" transition:fly={{ y: 20, duration: 300 }}>
    <div class="volume-header">
      <h3>Volume</h3>
      <button type="button" class="close-btn" on:click={handleClose} aria-label="Close">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      </button>
    </div>

    <div class="volume-content">
      <div class="volume-icon">
        {#if displayVolume === 0}
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
          </svg>
        {:else if displayVolume < 50}
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 9v6h4l5 5V4l-5 5H7z" />
          </svg>
        {:else}
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
          </svg>
        {/if}
      </div>

      <div class="volume-slider-container">
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={displayVolume}
          on:input={handleVolumeChange}
          class="volume-slider"
          aria-label="Volume"
        />
        <div class="volume-percentage">{displayVolume}%</div>
      </div>
    </div>
  </div>
</div>

<style>
  .volume-modal-backdrop {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
    padding: var(--spacing-md);
  }

  .volume-modal {
    background-color: var(--color-bg-secondary);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    min-width: 280px;
    max-width: 90vw;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--color-border);
  }

  .volume-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--spacing-lg);
  }

  .volume-header h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    padding: 0;
    background: none;
    border: none;
    border-radius: 50%;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all 0.2s;
  }

  .close-btn:hover {
    background-color: var(--color-bg-hover);
    color: var(--color-text-primary);
  }

  .volume-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-lg);
  }

  .volume-icon {
    color: var(--color-accent);
  }

  .volume-slider-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    align-items: center;
  }

  .volume-slider {
    width: 100%;
    height: 8px;
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    outline: none;
    cursor: pointer;
  }

  .volume-slider::-webkit-slider-runnable-track {
    width: 100%;
    height: 8px;
    background: var(--color-bg-tertiary);
    border-radius: 4px;
  }

  .volume-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    background: var(--color-accent);
    border-radius: 50%;
    cursor: pointer;
    margin-top: -8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .volume-slider::-moz-range-track {
    width: 100%;
    height: 8px;
    background: var(--color-bg-tertiary);
    border-radius: 4px;
  }

  .volume-slider::-moz-range-thumb {
    width: 24px;
    height: 24px;
    background: var(--color-accent);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .volume-percentage {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-text-primary);
    min-width: 60px;
    text-align: center;
  }
</style>

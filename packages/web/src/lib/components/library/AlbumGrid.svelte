<!-- eslint-disable -->
<script lang="ts">
  import type { MusicAlbum } from '@yaytsa/core';
  import { Grid } from 'svelte-virtual';
  import AlbumCard from './AlbumCard.svelte';

  export let albums: MusicAlbum[] = [];
  export let loading: boolean = false;
  export let onLoadMore: (() => void) | null = null;

  let gridElement: HTMLDivElement;
  const ALBUM_CARD_SIZE = 220;

  function handleScroll(event: Event) {
    if (!onLoadMore) return;
    const target = event.target as HTMLDivElement;
    const { scrollHeight, scrollTop, clientHeight } = target;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      onLoadMore();
    }
  }
</script>

<div class="album-grid-container" bind:this={gridElement} on:scroll={handleScroll}>
  {#if loading && albums.length === 0}
    <div class="loading">Loading albums...</div>
  {:else if albums.length === 0}
    <div class="empty">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" />
      </svg>
      <p>No albums found</p>
    </div>
  {:else}
    <Grid
      itemCount={albums.length}
      itemHeight={ALBUM_CARD_SIZE}
      itemWidth={ALBUM_CARD_SIZE}
      height="100%"
    >
      {#snippet item({ index, style })}
        <div style={style}>
          <AlbumCard album={albums[index]} />
        </div>
      {/snippet}
    </Grid>
    {#if loading}
      <div class="loading-more">Loading more albums...</div>
    {/if}
  {/if}
</div>

<style>
  .album-grid-container {
    width: 100%;
    height: calc(100vh - 200px);
    min-height: 500px;
    overflow: auto;
  }

  .loading,
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-md);
    padding: var(--spacing-xl);
    color: var(--color-text-secondary);
    text-align: center;
    height: 100%;
  }

  .empty svg {
    opacity: 0.5;
  }

  .loading-more {
    position: absolute;
    bottom: var(--spacing-lg);
    left: 50%;
    transform: translateX(-50%);
    padding: var(--spacing-md) var(--spacing-lg);
    background: var(--color-bg-secondary);
    border-radius: var(--radius-md);
    color: var(--color-text-secondary);
    font-size: 0.875rem;
  }

  @media (max-width: 768px) {
    .album-grid-container {
      height: calc(100vh - 150px);
    }
  }
</style>

import { css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

export const theme = css`
  :host {
    --bg-primary: #353535;
    --bg-secondary: #2a2a2a;
    --text-primary: #ffffff;
    --text-secondary: #cccccc;
    --accent: #4a9eff;
    --accent-hover: #6bb0ff;
    --border-radius: 8px;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
`;

export const baseStyles = css`
  .box {
    background: var(--bg-primary);
    color: var(--text-primary);
    padding: var(--spacing-md);
    margin: var(--spacing-md) 0;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
  }

  h2 {
    margin: 0 0 var(--spacing-md) 0;
    font-size: 1.25rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  h2 svg {
    width: 20px;
    height: 20px;
  }

  label {
    display: block;
    margin: var(--spacing-sm) 0;
    color: var(--text-primary);
  }

  button {
    background: var(--accent);
    color: var(--text-primary);
    border: none;
    padding: var(--spacing-sm) var(--spacing-md);
    margin: var(--spacing-sm);
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  button svg {
    width: 16px;
    height: 16px;
  }

  button:hover {
    background: var(--accent-hover);
  }

  input[type="range"] {
    width: 100%;
    margin: var(--spacing-sm) 0;
  }

  input[type="color"],
  input[type="text"],
  input[type="number"],
  select {
    padding: var(--spacing-sm);
    border-radius: 4px;
    border: 1px solid var(--bg-secondary);
    background: var(--bg-secondary);
    color: var(--text-primary);
  }
`;

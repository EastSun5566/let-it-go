import type { Component } from 'solid-js';

import { GithubCorner } from './components';

export const App: Component = () => (
  <>
    <header class="text-center">
      <h3>❄️ Welcome to LET IT GO</h3>
      <h5>Let your website snow instantly ⛄️</h5>

      <small class="d-block mt-3">
        Made with ❤️ By
        <a
          href="https://github.com/EastSun5566"
          class="badge badge-pill badge-primary"
          target="_blank"
        >
          EastSun5566
        </a>
      </small>
    </header>

    <main>
      <div>
        <div>
          <input
            type="checkbox"
            id="is-snow"
            checked
          />
          <label for="is-snow" />
        </div>

        <div>
          <button type="button" id="reset">
            RESET
          </button>
          <button type="button" id="toggle" />
        </div>
      </div>

      <div>
        <label for="number">❄️ NUMBER</label>
        <input
          type="number"
          id="number"
          placeholder="number of snowflake"
        />
      </div>

      <div>
        <label for="number">❄️ COLOR</label>
        <input
          type="color"
          id="color"
          placeholder="color of snowflake"
        />
      </div>
    </main>

    <GithubCorner />
  </>
);

export default App;

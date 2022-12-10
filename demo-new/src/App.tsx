import type { Component } from 'solid-js';

import logo from './logo.svg';

const App: Component = () => (
    <div>
      <header>
        <img src={logo} class="w-[300px]" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          href="https://github.com/solidjs/solid"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn Solid
        </a>
      </header>
    </div>
);

export default App;

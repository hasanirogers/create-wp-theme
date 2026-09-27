import { css } from 'lit';

export default css`
  :host {
    width: 100%;
    max-width: 640px;
    display: block;
    text-align: left;
  }

  form {
    margin-top: 2rem;
  }

  fieldset {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    border: none;
    margin: 0;
    padding: 0;
  }

  kemet-button {
    width: 100%;
  }

  .center {
    text-align: center;
  }
`;

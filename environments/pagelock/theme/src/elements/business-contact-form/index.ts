import { html, LitElement } from 'lit';
import { customElement, property, query, queryAll, state } from 'lit/decorators.js';
import HTMLKemetFieldElement from 'kemet-ui/field';
import HTMLKemetLoaderElement from 'kemet-ui/loader';

import styles from './styles';

interface IData {
  message: string;
  code: number;
};

@customElement('business-contact-form')
class BusinessContactForm extends LitElement {
  static styles = [styles];

  @property()
  url: string | null = null;

  @state()
  formMessage: string | null = null;

  @state()
  loading: boolean = false;

  @query('form')
  form!: HTMLFormElement;

  @queryAll('kemet-field')
  fields!: NodeListOf<HTMLKemetFieldElement>;

  @query('kemet-loader')
  loader!: HTMLKemetLoaderElement;

  render() {
    return html`
      <form @submit=${(event: Event) => this.sendMessage(event)}>
        <fieldset>
          <kemet-field label="Your Name*" message="Your name is required.">
            <kemet-input slot="input" name="fullname" required></kemet-input>
          </kemet-field>
          <kemet-field label="Your Email*" message="Your email is required.">
            <kemet-input slot="input" name="email" required></kemet-input>
          </kemet-field>
          <kemet-field label="Your Message*" message="Please leave a message.">
            <kemet-textarea slot="input" name="message" required></kemet-textarea>
          </kemet-field>
        </fieldset>
        <div class="center">
          ${this.loading ? html`<br /><kemet-loader></kemet-loader><br /><br />` : html`<br /><br />`}
          <kemet-button rounded type="submit">Send</kemet-button>
        </div>
        <p>${this.formMessage}</p>
      </form>
    `;
  }

  sendMessage(event: any) {
    event.preventDefault();
    const url = this.url;

    if (!url) return;

    setTimeout(async () => {
      const hasError = Array.from(this.fields).some(field => field.appearance === 'error');

      if (hasError) {
        this.formMessage = "Please fix the errors on the form!"
      } else {
        this.loading = true;
        const form = new FormData(this.form);

        const bodyData = {
          fullname: form.get('fullname'),
          email: form.get('email'),
          message: form.get('message'),
        };

        const config = {
          method: 'POST',
          body: JSON.stringify(bodyData),
          headers: {
            'Content-Type': 'application/json'
          }
        };

        try {
          const response = await fetch(url, config);
          const data = await response.json() as IData;
          this.loading = false;
          this.formMessage = data.message;
        } catch (error) {
          console.error(error);
        }
      }
    }, 1);

  }
}

export default BusinessContactForm;


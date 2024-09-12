import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

class StudentActions extends LitElement {
  static properties = {
    data: { type: Object }
  };

  constructor() {
    super();
    this.data = {};
  }

  render() {
    const { student, first, last, username, password } = this.data;

    return html`
      <div>
        <h1>Actions for ${first} ${last}</h1>
        <ul>
          ${this.renderAction('Setup Presentation', 'setup')}
          ${this.renderAction('Present', 'present')}
          ${this.renderAction('Log Time', 'log')}
          ${this.renderAction('Record Attendance', 'record')}
          ${this.renderAction('Review Attendance', 'review')}
          ${this.renderAction('See Git Contributions', 'git')}
          ${this.renderAction('Vote on Presentation', 'vote')}
          ${this.renderAction('Vote on Team Collaboration', 'easy')}
        </ul>
      </div>
    `;
  }

  renderAction(label, action) {
    const { student, username, password } = this.data;
    const actionLink = `/s/${action}?student=${student}&username=${username}&password=${password}`;
    return html`<li><a href="${actionLink}">${label}</a></li>`;
  }

  static styles = css`
    div {
      font-family: Arial, sans-serif;
      margin: 20px;
    }
    ul {
      list-style: none;
      padding: 0;
    }
    li {
      margin: 5px 0;
    }
    a {
      text-decoration: none;
      color: #007bff;
    }
  `;
}

customElements.define('student-actions', StudentActions);

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
          ${this.renderAction('Log Time', 'log-time')}
          ${this.renderAction('Record Attendance', 'record-attendance')}
          ${this.renderAction('Review Attendance', 'review-attendance')}
          ${this.renderAction('See Git Contributions', 'git-contributions')}
          ${this.renderAction('Vote on Presentation', 'vote-presentation')}
          ${this.renderAction('Vote on Team Collaboration', 'vote-collaboration')}
        </ul>
      </div>
    `;
  }

  renderAction(label, action) {
    const { student, username, password } = this.data;
    const actionLink = `/short/${action}?student=${student}&username=${username}&password=${password}`;
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

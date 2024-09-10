import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

class CredentialGenerator extends LitElement {
  static styles = css`
    .student-container {
      margin: 10px 0;
    }
    .student-container button {
      margin-left: 10px;
    }
    img {
      display: block;
      margin: 5px 0;
    }
  `;

  constructor() {
    super();
    this.students = [];
    this.selectedStudent = null;
    this.loadStudents();
  }

  async loadStudents() {
    const response = await fetch('students.json'); // Replace with the path to your JSON file
    this.students = await response.json();
    this.requestUpdate();
  }

  render() {
    return html`
      <div>
        <label for="student-select">Select a Student:</label>
        <select id="student-select" size="10" @change="${this.handleStudentSelection}">
          <option value="">--Select a student--</option>
          ${this.students.map(
            (student) => html`
              <option value="${student.student}">
                ${student.first} ${student.last}
              </option>
            `
          )}
        </select>
      </div>

      ${this.selectedStudent
        ? html`
            <div class="student-container">
              <div>
                <strong>${this.selectedStudent.first} ${this.selectedStudent.last}</strong>
              </div>
              <img
                src="${this.getQrCodeUrl(this.selectedStudent)}"
                alt="QR Code for ${this.selectedStudent.first}"
              />
              <button @click="${() => this.writeNfcTag(this.selectedStudent)}">
                Write NFC Tag
              </button>
              <button @click="${this.readNfcTag}">
                Read NFC Tag
              </button>
              <div id="output"></div>
            </div>
          `
        : ''}
    `;
  }

  handleStudentSelection(event) {
    const selectedId = event.target.value;
    this.selectedStudent = this.students.find((student) => student.student == selectedId);
    this.requestUpdate();
  }

  getQrCodeUrl(student) {
    return `https://zxing.org/w/chart?cht=qr&chs=350x350&chld=L&choe=UTF-8&chl=${encodeURIComponent(
      `${student.url}`
    )}`;
  }

  async writeNfcTag(student) {
    try {
      const ndef = new NDEFReader();
      await ndef.write(`${student.url}`);
      alert(`NFC tag written successfully for ${student.first} ${student.last}`);
    } catch (error) {
      console.error('Error writing NFC tag:', error);
      alert('Failed to write NFC tag.');
    }
  }

  async readNfcTag() {
    try {
      const ndef = new NDEFReader();
      await ndef.scan();
      ndef.onreading = (event) => {
        const message = event.message;
        let foundUrl = false;

        for (const record of message.records) {
          const textDecoder = new TextDecoder(record.encoding);
          const recordData = textDecoder.decode(record.data);
          if (recordData === `${this.selectedStudent.url}`) {
            alert('NFC tag content matches the expected URL.');
            foundUrl = true;
            break;
          }
        }

        if (!foundUrl) {
          alert('NFC tag content does not match the expected URL.');
        }
      };
    } catch (error) {
      console.error('Error reading NFC tag:', error);
      alert('Failed to read NFC tag.');
    }
  }
}

customElements.define('credential-generator', CredentialGenerator);

> ### IMPORTANT:<br/>This project is currently down and awaiting a full rewrite.

<h1 align="center">
  <br />
  <img src="https://raw.githubusercontent.com/infamous55/violet-pages/master/public/favicon.png" width="80" height="80" alt="Logo" />
  <br />
  Violet Pages
  <br />
</h1>

<h4 align="center">A minimalist app to manage your readings!</h4>

<p align="center">
  <img alt="GitHub branch checks state" src="https://img.shields.io/github/checks-status/infamous55/violet-pages/master" />
  <img alt="GitHub top language" src="https://img.shields.io/github/languages/top/infamous55/violet-pages" />
  <img alt="GitHub" src="https://img.shields.io/github/license/infamous55/violet-pages" />
</p>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#running-locally">Running Locally</a> •
  <a href="#to-do">To Do</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

## Key Features

- Authentication with Google OAuth 2.0
- Ability to organize books into lists
- Public and private list options
- Book data retrieved from Google Books API
- Book descriptions edited by GPT-3.5, then cached
- Keyboard accesibility
- Progressive Web App (PWA)

## Running Locally

1. Clone the repository

```bash
git clone https://github.com/infamous55/violet-pages.git && cd violet-pages
```

2. Install the dependencies

```bash
pnpm install
```

3. Setup the environment variables

```bash
cp .env.example .env && vim .env
```

4. Start the development server

```bash
pnpm run dev
```

## To Do

- [x] ~~Move to the new OpenAI Completions API~~
- [ ] Improve validation of file uploads
- [ ] Add the ability to order books inside a list

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

Distributed under the GNU General Public License v3.0. See `LICENSE` for more information.

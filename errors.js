const errors = {
  // Error for when a user is trying to access content that doesn't belong to them
  permission: `
      <html>
        <body>
          <h3>You do not have permission to perform this action.</h3>
          <p>Please either <a href="/login">login</a> or see <a href="/urls">your URLs</a>.</p>
        </body>
      </html>`,
  // Error for when a URL or other content does not exist or can't be found
  notFound: `
      <html>
        <body>
          <h3>URL does not exist.</h3>
          <p>Please either create a <a href="/urls/new">new URL</a> or see <a href="/urls">your URLs</a>.</p>
        </body>
      </html>`,
  // Error for when user needs to be logged in
  notLoggedIn: `
      <html>
        <body>
          <h3>You are not logged in.</h3>
          <p>Please <a href="/login">log in</a> or <a href="/register">register</a> to access this feature.</p>
        </body>
      </html>`
};

module.exports = errors;
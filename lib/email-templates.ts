// Email clients have inconsistent dark mode support.
// Light background with dark text is the safest baseline.
// Blue accent (#2563eb) matches the dashboard primary color.

const COLORS = {
    background: "#fafafa",
    card: "#ffffff",
    border: "#e4e4e7",
    foreground: "#09090b",
    muted: "#71717a",
    primary: "#2563eb",
    primaryForeground: "#ffffff",
    success: "#16a34a",
    error: "#dc2626",
    codeBg: "#f4f4f5",
};


const LOGO_URL = "https://res.cloudinary.com/dgewykhor/image/upload/v1777808054/gatewayos_tbnwrs.png";

const BASE_STYLES = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background-color: ${COLORS.background};
    color: ${COLORS.foreground};
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }
  .wrapper {
    max-width: 560px;
    margin: 0 auto;
    padding: 40px 16px;
  }
  .logo-row {
    text-align: center;
    margin-bottom: 32px;
  }
  .logo-text {
    font-size: 15px;
    font-weight: 600;
    color: ${COLORS.foreground};
    letter-spacing: -0.2px;
  }
  .logo-dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${COLORS.primary};
    margin-right: 6px;
    vertical-align: middle;
    position: relative;
    top: -1px;
  }
  .card {
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    border-radius: 8px;
    overflow: hidden;
  }
  .card-body {
    padding: 32px;
  }
  .heading {
    font-size: 20px;
    font-weight: 600;
    color: ${COLORS.foreground};
    margin-bottom: 8px;
    letter-spacing: -0.3px;
  }
  .subtext {
    font-size: 14px;
    color: ${COLORS.muted};
    line-height: 1.6;
    margin-bottom: 24px;
  }
  .btn-row {
    text-align: center;
    margin: 28px 0;
  }
  .btn {
    display: inline-block;
    padding: 11px 28px;
    background: ${COLORS.primary};
    color: ${COLORS.primaryForeground};
    text-decoration: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
  }
  .divider {
    height: 1px;
    background: ${COLORS.border};
    margin: 24px 0;
  }
  .code-box {
    background: ${COLORS.codeBg};
    border: 1px solid ${COLORS.border};
    border-radius: 6px;
    padding: 12px 16px;
    font-family: 'Fira Code', 'Courier New', monospace;
    font-size: 12px;
    color: ${COLORS.muted};
    word-break: break-all;
    margin-top: 12px;
  }
  .fine-print {
    font-size: 12px;
    color: ${COLORS.muted};
    line-height: 1.6;
    text-align: center;
  }
  .footer {
    text-align: center;
    padding: 24px 0 0;
  }
  .footer-text {
    font-size: 12px;
    color: ${COLORS.muted};
  }
  .footer-link {
    color: ${COLORS.primary};
    text-decoration: none;
  }
  @media only screen and (max-width: 600px) {
    .card-body { padding: 24px 20px; }
  }
`;

function buildEmail(body: string): string {
    const year = new Date().getFullYear();
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="wrapper">
    <div class="logo-row">
      <img src="${LOGO_URL}" alt="Delivflow" width="32" height="32" style="display:block;margin:0 auto 16px;border-radius:6px;" />
      <span class="logo-text">GatewayOS</span>
    </div>
    <div class="card">
      <div class="card-body">
        ${body}
      </div>
    </div>
    <div class="footer">
      <p class="footer-text">&copy; ${year} GatewayOS &nbsp;&middot;&nbsp;
        <a href="mailto:${process.env.EMAIL_USER}" class="footer-link">Support</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

export function verificationEmailTemplate(verificationLink: string) {
    const subject = "Verify your GatewayOS account";
    const text = `Verify your email: ${verificationLink} (expires in 1 hour)`;
    const template = buildEmail(`
    <h1 class="heading">Verify your email</h1>
    <p class="subtext">
      You're almost in. Click the button below to confirm your email address
      and activate your GatewayOS account.
    </p>
    <div class="btn-row">
      <a href="${verificationLink}" class="btn">Verify email address</a>
    </div>
    <p class="fine-print">Link expires in 1 hour.</p>
    <div class="divider"></div>
    <p class="fine-print" style="text-align:left;">
      If the button does not work, copy this link into your browser:
    </p>
    <div class="code-box">${verificationLink}</div>
  `);
    return { subject, text, template };
}

export function passwordResetEmailTemplate(resetLink: string) {
    const subject = "Reset your GatewayOS password";
    const text = `Reset your password: ${resetLink} (expires in 1 hour)`;
    const template = buildEmail(`
    <h1 class="heading">Reset your password</h1>
    <p class="subtext">
      We received a request to reset the password for your GatewayOS account.
      Click the button below to set a new one.
    </p>
    <div class="btn-row">
      <a href="${resetLink}" class="btn">Reset password</a>
    </div>
    <p class="fine-print">Link expires in 1 hour.</p>
    <div class="divider"></div>
    <p class="fine-print">
      If you did not request this, you can safely ignore this email.
      Your password will not change.
    </p>
  `);
    return { subject, text, template };
}

export function emailChangeConfirmationTemplate(
    newEmail: string,
    confirmationLink: string
) {
    const subject = "Confirm your new email address";
    const text = `Confirm your email change to ${newEmail}: ${confirmationLink}`;
    const template = buildEmail(`
    <h1 class="heading">Confirm email change</h1>
    <p class="subtext">
      You requested to update your GatewayOS account email to
      <strong>${newEmail}</strong>. Click below to confirm this change.
    </p>
    <div class="btn-row">
      <a href="${confirmationLink}" class="btn">Confirm new email</a>
    </div>
    <p class="fine-print">Link expires in 1 hour.</p>
    <div class="divider"></div>
    <p class="fine-print">
      If you did not make this request, contact support immediately.
    </p>
  `);
    return { subject, text, template };
}

export function welcomeEmailTemplate(userName: string) {
    const subject = "Welcome to GatewayOS";
    const text = `Welcome ${userName}. Your GatewayOS control plane is ready.`;
    const template = buildEmail(`
    <h1 class="heading">You're all set</h1>
    <p class="subtext">
      Hi ${userName}, your GatewayOS account is active. You can now configure
      routes, manage API keys, and monitor your gateway traffic from the
      control plane.
    </p>
    <div class="btn-row">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/overview" class="btn">
        Open control plane
      </a>
    </div>
    <div class="divider"></div>
    <p class="fine-print">
      If you did not create this account, contact support immediately.
    </p>
  `);
    return { subject, text, template };
}
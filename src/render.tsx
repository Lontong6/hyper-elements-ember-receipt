import { mkdir, writeFile } from "node:fs/promises";
import { ElementsError, formatDiagnostics, outline, render, validate } from "@hyper-elements/react";
import { emailClients, renderInEmailClients } from "@hyper-elements/email-clients";
import EmberReceipt from "./receipt";

const template = <EmberReceipt />;

try {
  // Validate with the email-client plugin: what Outlook, Gmail and Apple Mail
  // will remove or change, named per client.
  const report = validate(template, { plugins: [await emailClients()] });
  console.log("— validate() with the email-clients plugin —");
  console.log(formatDiagnostics(report.diagnostics) || "(no diagnostics)");
  if (!report.valid) {
    process.exitCode = 1;
    throw new Error("Template failed validation");
  }
  console.log("— outline() —");
  console.log(outline(template));

  const { html, text, diagnostics } = await render(template);
  console.log("— render() —");
  console.log(formatDiagnostics(diagnostics) || "(no diagnostics)");
  await mkdir("out", { recursive: true });
  await writeFile("out/email.html", html);
  await writeFile("out/email.txt", text);
  console.log(`wrote out/email.html (${html.length} bytes) and out/email.txt`);

  // The email as each client shows it, drawn locally by the emulator.
  const { previews, diagnostics: clientDiagnostics } = await renderInEmailClients(template);
  console.log("— renderInEmailClients() —");
  console.log(formatDiagnostics(clientDiagnostics) || "(no diagnostics)");
  await mkdir("out/clients", { recursive: true });
  for (const preview of previews) {
    await writeFile(`out/clients/${preview.filename}`, preview.html);
    console.log("wrote out/clients/" + preview.filename);
  }
} catch (e) {
  if (e instanceof ElementsError) {
    console.error(formatDiagnostics(e.diagnostics));
    process.exitCode = 1;
  } else {
    throw e;
  }
}

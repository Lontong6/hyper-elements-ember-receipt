import {
  Button,
  Column,
  component,
  defineTheme,
  Divider,
  Email,
  Heading,
  Image,
  LineBreak,
  Link,
  MergeTag,
  prop,
  Row,
  Section,
  Span,
  Table,
  TableCell,
  TableRow,
  Text,
  token,
} from "@hyper-elements/react";
import chips from "./chips.json";

/**
 * Ember Roast — an order receipt email.
 *
 * The order is data (below). Every number in the email — line amounts,
 * subtotal, tax, total — is computed from it, so the same template receipts
 * any order. Personalisation is merge tags, the totals are a `Table`, and
 * the template is validated with the `@hyper-elements/email-clients` plugin
 * in `src/render.tsx`, which also renders the per-client previews.
 */

const ember = defineTheme({
  colors: {
    background: "#efe9e1",
    foreground: "#26180f",
    primary: "#26180f",
    primaryForeground: "#fbf6ee",
    muted: "#6e5d4f",
    border: "#e3dad0",
  },
  fonts: {
    body: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    heading: "Georgia, 'Times New Roman', serif",
  },
  components: {
    Heading: {
      by: {
        level: {
          1: { fontSize: 29, lineHeight: 1.2, fontWeight: 700 },
          2: { fontSize: 17, lineHeight: 1.3, fontWeight: 700, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
        },
      },
    },
    Button: { borderRadius: 8, padding: [13, 26], fontWeight: 700 },
    Text: { lineHeight: 1.55 },
  },
});

/** A label over a value — the order number, the date, the payment method. */
const MetaField = component({
  type: "ember.MetaField",
  label: "Order meta field",
  description: "A small muted label over a value, for order facts.",
  props: {
    label: prop.text({ required: true }),
    value: prop.text({ required: true }),
  },
  render: ({ label, value }) => (
    <Column style={{ gap: 2 }}>
      <Text style={{ fontSize: 12, color: token("colors.muted"), fontWeight: 700, letterSpacing: 0.6 }}>
        {label.toUpperCase()}
      </Text>
      <Text style={{ fontWeight: 700 }}>{value}</Text>
    </Column>
  ),
});

// ——— The order. Change this and the whole receipt follows. ———

type Item = { name: string; detail: string; qty: number; priceCents: number; chip: string };

const order = {
  number: "ER-2481",
  placedOn: "Thursday, 12 November 2026",
  payment: "Visa ·· 4417",
  items: [
    { name: "Yirgacheffe, Ethiopia", detail: "Whole bean · 250 g · jasmine, bergamot, peach", qty: 2, priceCents: 1900, chip: chips.yirgacheffe },
    { name: "Huila Pink Bourbon, Colombia", detail: "Whole bean · 250 g · panela, red apple, cacao", qty: 1, priceCents: 2100, chip: chips.huila },
    { name: "Ember enamel mug", detail: "350 ml · ember orange", qty: 1, priceCents: 1600, chip: chips.mug },
  ] as Item[],
  shippingCents: 0,
  taxRate: 0.061,
};

const cents = (n: number) => `$${(n / 100).toFixed(2)}`;
const subtotal = order.items.reduce((sum, i) => sum + i.qty * i.priceCents, 0);
const tax = Math.round((subtotal + order.shippingCents) * order.taxRate);
const total = subtotal + order.shippingCents + tax;

const totals: Array<[string, string, boolean]> = [
  ["Subtotal", cents(subtotal), false],
  ["Shipping", order.shippingCents === 0 ? "Free" : cents(order.shippingCents), false],
  ["Tax", cents(tax), false],
  ["Total", cents(total), true],
];

export default function EmberReceipt() {
  return (
    <Email
      lang="en"
      theme={ember}
      width={600}
      previewText={`Your Ember Roast order ${order.number} is confirmed — receipt inside`}
      title={`Ember Roast receipt ${order.number}`}
      style={{ gap: 20 }}
    >
      {/* Masthead */}
      <Section style={{ backgroundColor: "#221610", padding: [30, 24] }}>
        <Column style={{ gap: 6, alignItems: "center" }}>
          <Text
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 27,
              fontWeight: 700,
              letterSpacing: 3.5,
              color: "#fbf6ee",
              textAlign: "center",
            }}
          >
            EMBER ROAST
          </Text>
          <Text style={{ color: "#c9bba9", fontSize: 13, textAlign: "center" }}>
            Small-batch coffee, roasted every Thursday in Portland, Oregon
          </Text>
        </Column>
      </Section>

      {/* Receipt card */}
      <Column style={{ backgroundColor: "#ffffff", padding: 36, gap: 20 }}>
        <Heading level={1}>
          Thanks, <MergeTag name="first_name" /> — your order is confirmed.
        </Heading>
        <Text style={{ color: token("colors.muted") }}>
          This is your receipt. Your beans are in Thursday&rsquo;s roast queue; the tracking link below goes live the
          moment your box leaves the roastery.
        </Text>

        <Row style={{ gap: 16 }}>
          <MetaField label="Order" value={order.number} />
          <MetaField label="Placed" value={order.placedOn} />
          <MetaField label="Paid with" value={order.payment} />
        </Row>

        <Column style={{ backgroundColor: "#fbf3ec", borderRadius: 10, padding: [14, 18], gap: 2 }}>
          <Text>
            <Span style={{ fontWeight: 700, color: "#b24318" }}>Roasting Thursday.</Span>{" "}
            <Span>
              Orders roast on Thursday and ship Friday morning, so the coffee that lands on your doorstep is days off
              the roast, never weeks.
            </Span>
          </Text>
        </Column>

        <Table
          style={{
            cellPadding: [10, 6],
            rowBorder: { width: 1, style: "solid", color: token("colors.border") },
          }}
        >
          <TableRow header>
            <TableCell style={{ width: 52 }} />
            <TableCell>Item</TableCell>
            <TableCell style={{ width: 44, textAlign: "center" }}>Qty</TableCell>
            <TableCell style={{ width: 84, textAlign: "right" }}>Amount</TableCell>
          </TableRow>
          {order.items.map((item) => (
            <TableRow key={item.name}>
              <TableCell>
                <Image src={{ src: item.chip, width: 120, height: 120 }} alt="" style={{ width: 40, borderRadius: 8 }} />
              </TableCell>
              <TableCell>
                <Span style={{ fontWeight: 700 }}>{item.name}</Span>
                <LineBreak />
                <Span style={{ color: token("colors.muted"), fontSize: 13 }}>{item.detail}</Span>
              </TableCell>
              <TableCell style={{ textAlign: "center" }}>{String(item.qty)}</TableCell>
              <TableCell style={{ textAlign: "right" }}>{cents(item.qty * item.priceCents)}</TableCell>
            </TableRow>
          ))}
        </Table>

        <Column style={{ gap: 6 }}>
          {totals.map(([label, value, isTotal]) => (
            <Row key={label} style={{ gap: 12 }}>
              <Text
                style={{
                  fontWeight: isTotal ? 700 : 400,
                  fontSize: isTotal ? 17 : 15,
                  color: isTotal ? token("colors.foreground") : token("colors.muted"),
                }}
              >
                {label}
              </Text>
              <Text
                style={{
                  fontWeight: isTotal ? 700 : 400,
                  fontSize: isTotal ? 17 : 15,
                  textAlign: "right",
                  flex: "none",
                  width: 90,
                  color: isTotal ? "#b24318" : token("colors.foreground"),
                }}
              >
                {value}
              </Text>
            </Row>
          ))}
        </Column>

        <Divider />

        <Row style={{ gap: 20 }}>
          <Column style={{ gap: 4 }}>
            <Heading level={2}>Deliver to</Heading>
            <Text style={{ color: token("colors.muted") }}>
              <MergeTag name="first_name" /> <MergeTag name="last_name" />
              <LineBreak />
              418 Alder Street
              <LineBreak />
              Portland, OR 97204
            </Text>
          </Column>
          <Column style={{ gap: 4 }}>
            <Heading level={2}>Arriving</Heading>
            <Text style={{ color: token("colors.muted") }}>
              Monday 16 – Tuesday 17 November
              <LineBreak />
              Tracked, carbon-neutral delivery
            </Text>
          </Column>
        </Row>

        <Button href={`https://emberroast.coffee/orders/${order.number}`}>Track your order</Button>

        <Text style={{ fontSize: 13, color: token("colors.muted") }}>
          Something not right — a wrong grind, a damaged bag? Reply to this email and a person (usually Sam, who roasts
          on Thursdays) will sort it out. Unopened bags can be returned within 30 days.
        </Text>
      </Column>

      {/* Footer */}
      <Column style={{ gap: 8, alignItems: "center", padding: [4, 24] }}>
        <Text style={{ fontSize: 12, color: token("colors.muted"), textAlign: "center" }}>
          Ember Roast Coffee Co. · 214 SE Ankeny Street, Portland, OR 97214
        </Text>
        <Row stackOnMobile={false} style={{ gap: 18, justifyContent: "center" }}>
          {[
            { text: "Manage subscription", href: "https://emberroast.coffee/account" },
            { text: "Gift cards", href: "https://emberroast.coffee/gift-cards" },
            { text: "Unsubscribe", href: "https://emberroast.coffee/unsubscribe" },
          ].map((l) => (
            <Text key={l.text} style={{ fontSize: 12, flex: "none" }}>
              <Link href={l.href} style={{ color: token("colors.muted") }}>
                {l.text}
              </Link>
            </Text>
          ))}
        </Row>
      </Column>
    </Email>
  );
}

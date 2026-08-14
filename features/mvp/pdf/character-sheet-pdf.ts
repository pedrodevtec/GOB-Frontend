import {
  PDFDocument,
  PDFFont,
  PDFPage,
  StandardFonts,
  rgb
} from "pdf-lib";

import type { MvpTableCharacter } from "../types";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 42;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const FOOTER_HEIGHT = 34;

const colors = {
  canvas: rgb(5 / 255, 9 / 255, 18 / 255),
  surface: rgb(9 / 255, 15 / 255, 28 / 255),
  elevated: rgb(15 / 255, 24 / 255, 40 / 255),
  border: rgb(36 / 255, 50 / 255, 68 / 255),
  gold: rgb(247 / 255, 196 / 255, 63 / 255),
  goldDark: rgb(196 / 255, 122 / 255, 19 / 255),
  forest: rgb(1 / 255, 74 / 255, 30 / 255),
  white: rgb(248 / 255, 250 / 255, 252 / 255),
  muted: rgb(170 / 255, 179 / 255, 192 / 255)
};

const archetypeLabels: Record<string, string> = {
  guardian_blade: "Guardião da Lâmina"
};

const trainingLabels: Record<string, string> = {
  combat: "Combate",
  defense: "Defesa",
  survival: "Sobrevivência",
  investigation: "Investigação",
  influence: "Influência",
  stealth: "Furtividade",
  healing: "Cura",
  spirituality: "Espiritualidade",
  craft: "Ofício"
};

const equipmentSlotLabels: Record<string, string> = {
  MAIN_HAND: "Mão principal",
  OFF_HAND: "Mão secundária",
  ARMOR: "Armadura",
  BOOTS: "Botas",
  BELT: "Cinto",
  AMULET: "Amuleto",
  NECKLACE: "Amuleto"
};

const attributeLabels: Record<string, string> = {
  strength: "Força",
  agility: "Agilidade",
  vigor: "Vigor",
  intellect: "Intelecto",
  presence: "Presença",
  spirit: "Espírito"
};

type PdfContext = {
  document: PDFDocument;
  regular: PDFFont;
  bold: PDFFont;
  page: PDFPage;
  y: number;
  characterName: string;
};

export type CharacterSheetPdfOptions = {
  archetypeName?: string;
};

export async function buildCharacterSheetPdf(
  character: MvpTableCharacter,
  options: CharacterSheetPdfOptions = {}
): Promise<Uint8Array> {
  const document = await PDFDocument.create();
  document.setTitle(`Ficha de ${character.name || "personagem"}`);
  document.setAuthor("Guardian of Bravantus");
  document.setSubject("Ficha de personagem do playtest");
  document.setCreator("Guardian of Bravantus");

  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const firstPage = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const context: PdfContext = {
    document,
    regular,
    bold,
    page: firstPage,
    y: PAGE_HEIGHT - MARGIN,
    characterName: character.name || "Personagem"
  };

  paintPage(context.page);
  drawFirstHeader(context, character);

  section(context, "Quem é");
  field(context, "Conceito", character.concept, true);
  twoColumnFields(context, [
    ["Origem", character.origin],
    ["Arquétipo", friendlyArchetype(character.archetypeKey, options.archetypeName)]
  ]);
  field(context, "Aparência", character.appearance);

  section(context, "História e motivação");
  field(context, "História", character.history ?? character.personalHistory, true);
  twoColumnFields(context, [
    ["Objetivo", character.motivation ?? character.desire],
    ["Vínculo", character.bond ?? character.narrativeBond]
  ]);
  field(context, "Promessa, culpa ou dever", character.promiseOrGuilt);
  field(context, "Motivo para agir com o grupo", character.reasonToActWithGroup);

  section(context, "A Marca");
  twoColumnFields(context, [
    ["Local", character.markLocation],
    ["Relação com a Marca", character.markAttitude]
  ]);
  field(context, "Aparência", character.markAppearance);
  field(context, "Reação", character.markReaction);
  if (character.guardianSoulsFear ?? character.fear) {
    field(context, "Medo pessoal", character.guardianSoulsFear ?? character.fear);
  }

  section(context, "Habilidades");
  twoColumnFields(context, [
    ["Força marcante", character.positiveTrait],
    ["Desafio marcante", character.negativeTrait]
  ]);
  statGrid(context, Object.entries(character.attributes ?? {}).map(([key, value]) => ({
    label: attributeLabels[key] ?? humanizeKey(key),
    value
  })));

  const resources = derivedResources(character);
  statGrid(context, [
    { label: "PV", value: resources.pv },
    { label: "Energia", value: resources.energy },
    { label: "Ascensão", value: resources.ascensionPoints }
  ]);

  const trainings = (character.trainings ?? []).map(
    (training) => trainingLabels[training] ?? humanizeKey(training)
  );
  field(context, "Treinamentos", trainings.length ? trainings.join(", ") : undefined);

  section(context, "Equipamentos iniciais");
  const equipment = character.equipment ?? character.initialEquipment ?? [];
  if (!equipment.length) {
    field(context, "Equipamentos", undefined);
  } else {
    for (const item of equipment) {
      field(
        context,
        friendlyEquipmentSlot(item.slot),
        [item.name, item.description].filter(Boolean).join(" - ")
      );
    }
  }

  addFooters(document, regular, character.name || "Personagem");
  return document.save();
}

function drawFirstHeader(context: PdfContext, character: MvpTableCharacter) {
  context.page.drawRectangle({
    x: MARGIN,
    y: context.y - 116,
    width: CONTENT_WIDTH,
    height: 116,
    color: colors.elevated,
    borderColor: colors.goldDark,
    borderWidth: 1
  });
  context.page.drawRectangle({
    x: MARGIN,
    y: context.y - 116,
    width: 7,
    height: 116,
    color: colors.forest
  });
  drawText(context.page, "GUARDIAN OF BRAVANTUS", MARGIN + 22, context.y - 24, 9, context.bold, colors.gold);
  drawText(context.page, safeText(character.name || "Personagem", context.bold), MARGIN + 22, context.y - 58, 24, context.bold, colors.white);
  drawText(
    context.page,
    sheetStatusLabel(character.sheetStatus),
    MARGIN + 22,
    context.y - 84,
    11,
    context.bold,
    colors.muted
  );
  drawText(context.page, "FICHA DO PERSONAGEM", PAGE_WIDTH - MARGIN - 118, context.y - 24, 8, context.bold, colors.muted);
  context.y -= 140;
}

function addPage(context: PdfContext) {
  context.page = context.document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  paintPage(context.page);
  drawText(context.page, "GUARDIAN OF BRAVANTUS", MARGIN, PAGE_HEIGHT - MARGIN, 9, context.bold, colors.gold);
  drawText(
    context.page,
    safeText(context.characterName, context.bold),
    PAGE_WIDTH - MARGIN - context.bold.widthOfTextAtSize(safeText(context.characterName, context.bold), 9),
    PAGE_HEIGHT - MARGIN,
    9,
    context.bold,
    colors.muted
  );
  context.y = PAGE_HEIGHT - MARGIN - 34;
}

function paintPage(page: PDFPage) {
  page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: colors.canvas });
}

function section(context: PdfContext, title: string) {
  ensureSpace(context, 110);
  context.y -= 10;
  context.page.drawRectangle({
    x: MARGIN,
    y: context.y - 25,
    width: CONTENT_WIDTH,
    height: 30,
    color: colors.surface,
    borderColor: colors.border,
    borderWidth: 1
  });
  context.page.drawRectangle({ x: MARGIN, y: context.y - 25, width: 4, height: 30, color: colors.goldDark });
  drawText(context.page, safeText(title, context.bold), MARGIN + 14, context.y - 15, 13, context.bold, colors.gold);
  context.y -= 42;
}

function field(
  context: PdfContext,
  label: string,
  value?: string | number | null,
  prominent = false
) {
  const labelText = safeText(label.toLocaleUpperCase("pt-BR"), context.bold);
  const bodyText = safeText(value === undefined || value === null || value === "" ? "Não informado" : String(value), context.regular);
  const size = prominent ? 12 : 10;
  const bodyFont = prominent ? context.bold : context.regular;
  const lines = wrapText(bodyText, bodyFont, size, CONTENT_WIDTH - 24);
  const height = 35 + lines.length * (size + 4);
  ensureSpace(context, height + 8);
  context.page.drawRectangle({
    x: MARGIN,
    y: context.y - height,
    width: CONTENT_WIDTH,
    height,
    color: colors.surface,
    borderColor: colors.border,
    borderWidth: 1
  });
  drawText(context.page, labelText, MARGIN + 12, context.y - 18, 8, context.bold, colors.gold);
  lines.forEach((line, index) => {
    drawText(context.page, line, MARGIN + 12, context.y - 38 - index * (size + 4), size, bodyFont, prominent ? colors.white : colors.muted);
  });
  context.y -= height + 8;
}

function twoColumnFields(
  context: PdfContext,
  fields: Array<[string, string | number | null | undefined]>
) {
  const gap = 10;
  const width = (CONTENT_WIDTH - gap) / 2;
  const prepared = fields.map(([label, value]) => {
    const body = safeText(value === undefined || value === null || value === "" ? "Não informado" : String(value), context.regular);
    const lines = wrapText(body, context.regular, 10, width - 24);
    return { label, lines };
  });
  const height = Math.max(...prepared.map((item) => 35 + item.lines.length * 14));
  ensureSpace(context, height + 8);
  prepared.forEach((item, index) => {
    const x = MARGIN + index * (width + gap);
    context.page.drawRectangle({
      x,
      y: context.y - height,
      width,
      height,
      color: colors.surface,
      borderColor: colors.border,
      borderWidth: 1
    });
    drawText(context.page, safeText(item.label.toLocaleUpperCase("pt-BR"), context.bold), x + 12, context.y - 18, 8, context.bold, colors.gold);
    item.lines.forEach((line, lineIndex) => {
      drawText(context.page, line, x + 12, context.y - 38 - lineIndex * 14, 10, context.regular, colors.muted);
    });
  });
  context.y -= height + 8;
}

function statGrid(context: PdfContext, items: Array<{ label: string; value?: number }>) {
  if (!items.length) return;
  const columns = Math.min(items.length, 6);
  const gap = 7;
  const width = (CONTENT_WIDTH - gap * (columns - 1)) / columns;
  const height = 58;
  ensureSpace(context, height + 8);
  items.forEach((item, index) => {
    const x = MARGIN + (index % columns) * (width + gap);
    const row = Math.floor(index / columns);
    const y = context.y - row * (height + gap);
    context.page.drawRectangle({
      x,
      y: y - height,
      width,
      height,
      color: colors.elevated,
      borderColor: colors.border,
      borderWidth: 1
    });
    const label = safeText(item.label.toLocaleUpperCase("pt-BR"), context.bold);
    drawText(context.page, label, x + (width - context.bold.widthOfTextAtSize(label, 7)) / 2, y - 18, 7, context.bold, colors.muted);
    const value = String(item.value ?? 0);
    drawText(context.page, value, x + (width - context.bold.widthOfTextAtSize(value, 18)) / 2, y - 44, 18, context.bold, colors.gold);
  });
  const rows = Math.ceil(items.length / columns);
  context.y -= rows * height + (rows - 1) * gap + 8;
}

function ensureSpace(context: PdfContext, height: number) {
  if (context.y - height < FOOTER_HEIGHT + MARGIN) addPage(context);
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const paragraphs = text.split(/\r?\n/);
  const lines: string[] = [];
  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (!words.length) {
      lines.push("");
      continue;
    }
    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        current = candidate;
      } else if (current) {
        lines.push(current);
        current = word;
      } else {
        lines.push(word);
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

function safeText(value: string, font: PDFFont): string {
  return Array.from(value.normalize("NFC")).map((character) => {
    try {
      font.encodeText(character);
      return character;
    } catch {
      return "?";
    }
  }).join("");
}

function drawText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  size: number,
  font: PDFFont,
  color: ReturnType<typeof rgb>
) {
  page.drawText(text, { x, y, size, font, color });
}

function addFooters(document: PDFDocument, font: PDFFont, characterName: string) {
  const pages = document.getPages();
  pages.forEach((page, index) => {
    page.drawLine({
      start: { x: MARGIN, y: FOOTER_HEIGHT + 8 },
      end: { x: PAGE_WIDTH - MARGIN, y: FOOTER_HEIGHT + 8 },
      color: colors.border,
      thickness: 1
    });
    drawText(page, safeText(`Ficha de ${characterName}`, font), MARGIN, FOOTER_HEIGHT - 7, 8, font, colors.muted);
    const pageLabel = `${index + 1} / ${pages.length}`;
    drawText(page, pageLabel, PAGE_WIDTH - MARGIN - font.widthOfTextAtSize(pageLabel, 8), FOOTER_HEIGHT - 7, 8, font, colors.muted);
  });
}

function friendlyArchetype(value?: string | null, configuredName?: string) {
  if (configuredName) return configuredName;
  if (!value) return undefined;
  return archetypeLabels[value] ?? humanizeKey(value);
}

function friendlyEquipmentSlot(value?: string | null) {
  if (!value) return "Equipamento";
  return equipmentSlotLabels[value] ?? humanizeKey(value);
}

function humanizeKey(value: string) {
  return value
    .replaceAll("_", " ")
    .toLocaleLowerCase("pt-BR")
    .replace(/\b\w/g, (letter) => letter.toLocaleUpperCase("pt-BR"));
}

function sheetStatusLabel(status?: string) {
  if (status === "APPROVED") return "Aprovado pelo Mestre";
  if (status === "SUBMITTED") return "Enviado ao Mestre";
  if (status === "CHANGES_REQUESTED") return "Ajustes solicitados";
  return "Em criação";
}

function derivedResources(character: MvpTableCharacter) {
  const vigor = Number(character.attributes?.vigor ?? 0);
  const spirit = Number(character.attributes?.spirit ?? 0);
  return {
    pv: character.derivedResources?.pv ?? character.derivedResources?.hp ?? 10 + vigor * 4,
    energy: character.derivedResources?.energy ?? 6 + vigor + spirit,
    ascensionPoints:
      character.derivedResources?.ascensionPoints ??
      character.derivedResources?.pontosAscensao ??
      2 + spirit
  };
}

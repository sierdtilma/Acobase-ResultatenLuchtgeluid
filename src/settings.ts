"use strict";

import powerbi from "powerbi-visuals-api";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsCompositeCard = formattingSettings.CompositeCard;
import FormattingSettingsModel = formattingSettings.Model;
import FormattingSettingsSlice = formattingSettings.Slice;

const GRAPH_LINE_STYLES = [
    { value: "solid", displayName: "Doorgetrokken" },
    { value: "dashed", displayName: "Gestreept" },
    { value: "dotted", displayName: "Gestippeld" }
];

class GeneralStyleCardSettings extends FormattingSettingsCard {
    titleVisible = new formattingSettings.ToggleSwitch({
        name: "titleVisible",
        displayName: "Titel tonen",
        value: true
    });

    titleText = new formattingSettings.TextInput({
        name: "titleText",
        displayName: "Titel",
        value: "Resultaten luchtgeluid",
        placeholder: "Resultaten luchtgeluid"
    });

    titleFontFamily = new formattingSettings.TextInput({
        name: "titleFontFamily",
        displayName: "Titel lettertype",
        value: "Segoe UI",
        placeholder: "Segoe UI"
    });

    titleFontSize = new formattingSettings.NumUpDown({
        name: "titleFontSize",
        displayName: "Titel tekstgrootte",
        value: 16
    });

    titleBold = new formattingSettings.ToggleSwitch({
        name: "titleBold",
        displayName: "Titel vet",
        value: true
    });

    titleColor = new formattingSettings.ColorPicker({
        name: "titleColor",
        displayName: "Titel kleur",
        value: { value: "#1f2937" }
    });

    decimals = new formattingSettings.NumUpDown({
        name: "decimals",
        displayName: "Decimalen",
        value: 1
    });

    name = "generalStyle";
    displayName = "Algemeen";
    slices: Array<FormattingSettingsSlice> = [
        this.titleVisible,
        this.titleText,
        this.titleFontFamily,
        this.titleFontSize,
        this.titleBold,
        this.titleColor,
        this.decimals
    ];
}

class WindowTitleBarsCardSettings extends FormattingSettingsCard {
    lineHeight = new formattingSettings.NumUpDown({
        name: "windowTitleLineHeight",
        displayName: "Regelhoogte",
        value: 1.2
    });
    verticalPadding = new formattingSettings.NumUpDown({
        name: "windowTitleVerticalPadding",
        displayName: "Verticale padding (px)",
        value: 8
    });
    horizontalPadding = new formattingSettings.NumUpDown({
        name: "windowTitleHorizontalPadding",
        displayName: "Horizontale padding (px)",
        value: 10
    });
    name = "windowTitleBars";
    displayName = "Titelbalken";
    slices: Array<FormattingSettingsSlice> = [this.lineHeight, this.verticalPadding, this.horizontalPadding];
}

class TableTitleStyleCardSettings extends FormattingSettingsCard {
    titleText = new formattingSettings.TextInput({ name: "titleText", displayName: "Titel", value: "DnT per meting", placeholder: "DnT per meting" });
    fontFamily = new formattingSettings.FontPicker({ name: "fontFamily", displayName: "Lettertype", value: "Segoe UI" });
    fontSize = new formattingSettings.NumUpDown({ name: "fontSize", displayName: "Tekstgrootte", value: 13 });
    bold = new formattingSettings.ToggleSwitch({ name: "bold", displayName: "Vet", value: true });
    italic = new formattingSettings.ToggleSwitch({ name: "italic", displayName: "Cursief", value: false });
    underline = new formattingSettings.ToggleSwitch({ name: "underline", displayName: "Onderstrepen", value: false });
    fontControl = new formattingSettings.FontControl({ name: "fontControl", displayName: "Tekstopmaak", fontFamily: this.fontFamily, fontSize: this.fontSize, bold: this.bold, italic: this.italic, underline: this.underline });
    color = new formattingSettings.ColorPicker({ name: "color", displayName: "Tekstkleur", value: { value: "#1f2937" } });
    backgroundColor = new formattingSettings.ColorPicker({ name: "backgroundColor", displayName: "Achtergrond", value: { value: "#f3f4f6" } });
    name = "tableTitleStyle";
    displayName = "Tabellen - Titel";
    slices: Array<FormattingSettingsSlice> = [this.titleText, this.fontControl, this.color, this.backgroundColor];
}

class TableSpacingStyleCardSettings extends FormattingSettingsCard {
    headerRowPadding = new formattingSettings.NumUpDown({ name: "headerRowPadding", displayName: "Celpadding koprijen (px)", value: 4 });
    measurementRowPadding = new formattingSettings.NumUpDown({ name: "measurementRowPadding", displayName: "Celpadding metingrijen (px)", value: 4 });
    detailRowPadding = new formattingSettings.NumUpDown({ name: "detailRowPadding", displayName: "Celpadding detailrijen (px)", value: 4 });
    name = "tableSpacing";
    displayName = "Tabellen - Spacing";
    slices: Array<FormattingSettingsSlice> = [this.headerRowPadding, this.measurementRowPadding, this.detailRowPadding];
}

class ReportTitleCardSettings extends FormattingSettingsCard {
    titleText = new formattingSettings.TextInput({ name: "reportTitleText", displayName: "Titel", value: "Rapporttabel", placeholder: "Rapporttabel" });
    fontFamily = new formattingSettings.FontPicker({ name: "reportTitleFontFamily", displayName: "Lettertype", value: "Segoe UI" });
    fontSize = new formattingSettings.NumUpDown({ name: "reportTitleFontSize", displayName: "Tekstgrootte", value: 12 });
    bold = new formattingSettings.ToggleSwitch({ name: "reportTitleBold", displayName: "Vet", value: true });
    italic = new formattingSettings.ToggleSwitch({ name: "reportTitleItalic", displayName: "Cursief", value: false });
    underline = new formattingSettings.ToggleSwitch({ name: "reportTitleUnderline", displayName: "Onderstrepen", value: false });
    fontControl = new formattingSettings.FontControl({ name: "reportTitleFontControl", displayName: "Tekstopmaak", fontFamily: this.fontFamily, fontSize: this.fontSize, bold: this.bold, italic: this.italic, underline: this.underline });
    color = new formattingSettings.ColorPicker({ name: "reportTitleColor", displayName: "Tekstkleur", value: { value: "#1f2937" } });
    backgroundColor = new formattingSettings.ColorPicker({ name: "reportTitleBackgroundColor", displayName: "Achtergrond", value: { value: "#f3f4f6" } });
    name = "reportTitle";
    displayName = "Titel";
    slices: Array<FormattingSettingsSlice> = [this.titleText, this.fontControl, this.color, this.backgroundColor];
}

class ReportSpacingCardSettings extends FormattingSettingsCard {
    rowHeight = new formattingSettings.NumUpDown({
        name: "rowHeight",
        displayName: "Rijhoogte frequenties (px)",
        value: 18
    });
    frequencyColumnWidth = new formattingSettings.NumUpDown({
        name: "frequencyColumnWidth",
        displayName: "Breedte Frequentie-kolom (px)",
        value: 55
    });
    measurementColumnWidth = new formattingSettings.NumUpDown({
        name: "measurementColumnWidth",
        displayName: "Breedte metingkolommen (px)",
        value: 62
    });

    name = "reportSpacing";
    displayName = "Spacing";
    slices: Array<FormattingSettingsSlice> = [this.rowHeight, this.frequencyColumnWidth, this.measurementColumnWidth];
}

class ReportLinesCardSettings extends FormattingSettingsCard {
    octaveBandColor = new formattingSettings.ColorPicker({ name: "octaveBandLineColor", displayName: "Kleur lijnen tussen octaafbanden", value: { value: "#e5e7eb" } });
    octaveBandWidth = new formattingSettings.NumUpDown({ name: "octaveBandLineWidth", displayName: "Dikte lijnen tussen octaafbanden (px)", value: 1 });
    resultRowColor = new formattingSettings.ColorPicker({ name: "resultRowLineColor", displayName: "Kleur lijnen tussen resultaatrijen", value: { value: "#9ca3af" } });
    resultRowWidth = new formattingSettings.NumUpDown({ name: "resultRowLineWidth", displayName: "Dikte lijnen tussen resultaatrijen (px)", value: 2 });
    verticalColor = new formattingSettings.ColorPicker({ name: "reportVerticalLineColor", displayName: "Kleur verticale lijnen", value: { value: "#e5e7eb" } });
    verticalWidth = new formattingSettings.NumUpDown({ name: "reportVerticalLineWidth", displayName: "Dikte verticale lijnen (px)", value: 1 });
    name = "reportLines";
    displayName = "Lijnen";
    slices: Array<FormattingSettingsSlice> = [this.octaveBandColor, this.octaveBandWidth, this.resultRowColor, this.resultRowWidth, this.verticalColor, this.verticalWidth];
}

class WindowLinesCardSettings extends FormattingSettingsCard {
    reportVisible = new formattingSettings.ToggleSwitch({ name: "reportWindowLineVisible", displayName: "Rapporttabel lijn tonen", value: true });
    reportColor = new formattingSettings.ColorPicker({ name: "reportWindowLineColor", displayName: "Rapporttabel kleur", value: { value: "#d1d5db" } });
    reportWidth = new formattingSettings.NumUpDown({ name: "reportWindowLineWidth", displayName: "Rapporttabel dikte (px)", value: 1 });
    graphVisible = new formattingSettings.ToggleSwitch({ name: "graphWindowLineVisible", displayName: "Grafiek lijn tonen", value: true });
    graphColor = new formattingSettings.ColorPicker({ name: "graphWindowLineColor", displayName: "Grafiek kleur", value: { value: "#d1d5db" } });
    graphWidth = new formattingSettings.NumUpDown({ name: "graphWindowLineWidth", displayName: "Grafiek dikte (px)", value: 1 });
    tableVisible = new formattingSettings.ToggleSwitch({ name: "tableWindowLineVisible", displayName: "Resultatentabel lijn tonen", value: true });
    tableColor = new formattingSettings.ColorPicker({ name: "tableWindowLineColor", displayName: "Resultatentabel kleur", value: { value: "#d1d5db" } });
    tableWidth = new formattingSettings.NumUpDown({ name: "tableWindowLineWidth", displayName: "Resultatentabel dikte (px)", value: 1 });
    sideVisible = new formattingSettings.ToggleSwitch({ name: "sideWindowLineVisible", displayName: "Zijpaneel lijn tonen", value: true });
    sideColor = new formattingSettings.ColorPicker({ name: "sideWindowLineColor", displayName: "Zijpaneel kleur", value: { value: "#d1d5db" } });
    sideWidth = new formattingSettings.NumUpDown({ name: "sideWindowLineWidth", displayName: "Zijpaneel dikte (px)", value: 1 });
    name = "windowLines";
    displayName = "Vensterlijnen";
    slices: Array<FormattingSettingsSlice> = [
        this.reportVisible, this.reportColor, this.reportWidth,
        this.graphVisible, this.graphColor, this.graphWidth,
        this.tableVisible, this.tableColor, this.tableWidth,
        this.sideVisible, this.sideColor, this.sideWidth
    ];
}

export class ReportTextStyleSettings {
    alignment: formattingSettings.AlignmentGroup;
    fontFamily: formattingSettings.FontPicker;
    fontSize: formattingSettings.NumUpDown;
    bold: formattingSettings.ToggleSwitch;
    italic: formattingSettings.ToggleSwitch;
    underline: formattingSettings.ToggleSwitch;
    fontControl: formattingSettings.FontControl;
    color: formattingSettings.ColorPicker;
    backgroundColor: formattingSettings.ColorPicker;
    decimals?: formattingSettings.NumUpDown;
    slices: Array<FormattingSettingsSlice>;

    constructor(prefix: string, alignmentValue: string, background: string = "#ffffff", includeDecimals: boolean = false) {
        this.alignment = new formattingSettings.AlignmentGroup({ name: `${prefix}Alignment`, displayName: "Uitlijning", mode: powerbi.visuals.AlignmentGroupMode.Horizonal, value: alignmentValue });
        this.fontFamily = new formattingSettings.FontPicker({ name: `${prefix}FontFamily`, displayName: "Lettertype", value: "Segoe UI" });
        this.fontSize = new formattingSettings.NumUpDown({ name: `${prefix}FontSize`, displayName: "Tekstgrootte", value: 11 });
        this.bold = new formattingSettings.ToggleSwitch({ name: `${prefix}Bold`, displayName: "Vet", value: false });
        this.italic = new formattingSettings.ToggleSwitch({ name: `${prefix}Italic`, displayName: "Cursief", value: false });
        this.underline = new formattingSettings.ToggleSwitch({ name: `${prefix}Underline`, displayName: "Onderstrepen", value: false });
        this.fontControl = new formattingSettings.FontControl({ name: `${prefix}FontControl`, displayName: "Tekstopmaak", fontFamily: this.fontFamily, fontSize: this.fontSize, bold: this.bold, italic: this.italic, underline: this.underline });
        this.color = new formattingSettings.ColorPicker({ name: `${prefix}Color`, displayName: "Tekstkleur", value: { value: "#1f2937" } });
        this.backgroundColor = new formattingSettings.ColorPicker({ name: `${prefix}BackgroundColor`, displayName: "Achtergrond", value: { value: background } });
        this.slices = [this.fontControl, this.alignment, this.color, this.backgroundColor];
        if (includeDecimals) {
            this.decimals = new formattingSettings.NumUpDown({ name: `${prefix}Decimals`, displayName: "Decimalen", value: 1 });
            this.slices.push(this.decimals);
        }
    }
}

class TopWindowColumnStyleSettings extends ReportTextStyleSettings {
    headerBackgroundColor: formattingSettings.ColorPicker;

    constructor(prefix: string, alignmentValue: string) {
        super(prefix, alignmentValue);
        this.headerBackgroundColor = new formattingSettings.ColorPicker({
            name: `${prefix}HeaderBackgroundColor`,
            displayName: "Achtergrond kolomkop",
            value: { value: "#f3f4f6" }
        });
        this.slices.push(this.headerBackgroundColor);
    }
}

class ReportTextCardSettings extends FormattingSettingsCard {
    frequency = new ReportTextStyleSettings("reportFrequency", "left", "#ffffff");
    measurement = new ReportTextStyleSettings("reportMeasurement", "right", "#ffffff");
    decimals = new formattingSettings.NumUpDown({ name: "reportDecimals", displayName: "Decimalen", value: 1 });
    name = "reportText";
    displayName = "Tekst";
    slices: Array<FormattingSettingsSlice> = [this.decimals];
}

class ReportSummaryCardSettings {
    dnTA = new ReportTextStyleSettings("reportDnTA", "right", "#ffffff");
    dnTAKRoom = new ReportTextStyleSettings("reportDnTAKRoom", "right", "#ffffff");
    dnTAKArea = new ReportTextStyleSettings("reportDnTAKArea", "right", "#ffffff");
}

class TopWindowColumnsCardSettings extends FormattingSettingsCard {
    private static readonly columns = [
        { value: "measurement", displayName: "Meting" },
        { value: "description", displayName: "Omschrijving" },
        { value: "toelichting", displayName: "Toelichting" },
        ...Array.from({ length: 10 }, (_, index) => ({ value: `detail${index}`, displayName: `Rapport details ${index + 1}` }))
    ];

    selectedColumn = new formattingSettings.ItemDropdown({
        name: "topSelectedColumn",
        displayName: "Kolom",
        items: TopWindowColumnsCardSettings.columns,
        value: TopWindowColumnsCardSettings.columns[0]
    });
    styles: Record<string, TopWindowColumnStyleSettings> = {};
    detailColumnNames: string[] = [];
    name = "topWindowColumns";
    displayName = "Bovenvenster - Kolommen";
    slices: Array<FormattingSettingsSlice> = [this.selectedColumn];

    constructor() {
        super();
        for (const column of TopWindowColumnsCardSettings.columns) {
            const style = new TopWindowColumnStyleSettings(`top${column.value.charAt(0).toUpperCase()}${column.value.slice(1)}`, column.value === "measurement" ? "center" : "left");
            this.styles[column.value] = style;
            this.slices.push(...style.slices);
        }
    }

    onPreProcess(): void {
        const available = TopWindowColumnsCardSettings.columns.filter((column) =>
            !column.value.startsWith("detail") || Number(column.value.slice(6)) < this.detailColumnNames.length
        ).map((column) => {
            const index = column.value.startsWith("detail") ? Number(column.value.slice(6)) : -1;
            return index >= 0 ? { value: column.value, displayName: this.detailColumnNames[index] || column.displayName } : column;
        });
        this.selectedColumn.items = available;
        this.selectedColumn.value = available.find((column) => column.value === this.selectedColumn.value?.value) ?? available[0];
        const selected = String(this.selectedColumn.value.value);
        for (const [key, style] of Object.entries(this.styles)) {
            style.slices.forEach((slice) => slice.visible = key === selected);
        }
    }
}

class TopWindowLinesCardSettings extends FormattingSettingsCard {
    horizontalColor = new formattingSettings.ColorPicker({
        name: "topWindowHorizontalLineColor",
        displayName: "Horizontale lijnkleur",
        value: { value: "#e5e7eb" }
    });
    horizontalWidth = new formattingSettings.NumUpDown({
        name: "topWindowHorizontalLineWidth",
        displayName: "Horizontale lijndikte (px)",
        value: 1
    });
    verticalColor = new formattingSettings.ColorPicker({
        name: "topWindowVerticalLineColor",
        displayName: "Verticale lijnkleur",
        value: { value: "#e5e7eb" }
    });
    verticalWidth = new formattingSettings.NumUpDown({
        name: "topWindowVerticalLineWidth",
        displayName: "Verticale lijndikte (px)",
        value: 1
    });
    name = "topWindowLines";
    displayName = "Bovenvenster - Lijnen";
    slices: Array<FormattingSettingsSlice> = [
        this.horizontalColor,
        this.horizontalWidth,
        this.verticalColor,
        this.verticalWidth
    ];
}

class ReportFormattingCardSettings extends FormattingSettingsCompositeCard {
    name = "reportStyle";
    displayName = "Rapport";
    groups: Array<formattingSettings.Group>;
    selectedRow = new formattingSettings.ItemDropdown({
        name: "selectedReportRow",
        displayName: "Rij",
        items: [
            { value: "frequency", displayName: "Frequentie" },
            { value: "measurement", displayName: "Metingen" },
            { value: "dnTA", displayName: "DnT,A" },
            { value: "dnTAKRoom", displayName: "DnT,A;k VR" },
            { value: "dnTAKArea", displayName: "DnT,A;k VG" }
        ],
        value: { value: "frequency", displayName: "Frequentie" }
    });

    constructor(title: ReportTitleCardSettings, spacing: ReportSpacingCardSettings, lines: ReportLinesCardSettings, text: ReportTextCardSettings, summary: ReportSummaryCardSettings, windowLines: WindowLinesCardSettings) {
        super();
        this.groups = [new formattingSettings.Group({
            name: title.name,
            displayName: title.displayName,
            collapsible: true,
            slices: title.slices
        }), new formattingSettings.Group({
            name: "reportColumn",
            displayName: "Kolom",
            collapsible: true,
            slices: [
                this.selectedRow,
                text.decimals,
                ...text.frequency.slices,
                ...text.measurement.slices,
                ...summary.dnTA.slices,
                ...summary.dnTAKRoom.slices,
                ...summary.dnTAKArea.slices
            ]
        }), new formattingSettings.Group({
            name: spacing.name,
            displayName: spacing.displayName,
            collapsible: true,
            slices: spacing.slices
        }), new formattingSettings.Group({
            name: lines.name,
            displayName: lines.displayName,
            collapsible: true,
            slices: lines.slices
        })];
    }

    onPreProcess(): void {
        const selected = String(this.selectedRow.value.value);
        const visibility: Record<string, FormattingSettingsSlice[]> = {
            frequency: this.getSlices("reportFrequency"),
            measurement: this.getSlices("reportMeasurement"),
            dnTA: this.getSlices("reportDnTA"),
            dnTAKRoom: this.getSlices("reportDnTAKRoom"),
            dnTAKArea: this.getSlices("reportDnTAKArea")
        };
        for (const [key, slices] of Object.entries(visibility)) {
            slices.forEach((slice) => slice.visible = key === selected);
        }
    }

    private getSlices(prefix: string): FormattingSettingsSlice[] {
        const group = this.groups.find((candidate) => candidate.name === "reportColumn");
        return group ? group.slices.filter((slice) => String(slice.name).startsWith(prefix)) : [];
    }
}

interface TableColumnStyleSettings {
    columnName: formattingSettings.TextInput;
    alignment: formattingSettings.AlignmentGroup;
    fontControl: formattingSettings.FontControl;
    fontFamily: formattingSettings.FontPicker;
    fontSize: formattingSettings.NumUpDown;
    bold: formattingSettings.ToggleSwitch;
    italic: formattingSettings.ToggleSwitch;
    underline: formattingSettings.ToggleSwitch;
    color: formattingSettings.ColorPicker;
    backgroundColor: formattingSettings.ColorPicker;
}

class TableColumnsStyleCardSettings extends FormattingSettingsCard {
    private static readonly labelColumnCount = 10;
    private static readonly columns = [
        ...Array.from({ length: TableColumnsStyleCardSettings.labelColumnCount }, (_, index) => ({
            value: `label${index}`,
            displayName: `Measurement ${index + 1}`
        })),
        { value: "info", displayName: "Info" },
        { value: "dnTA", displayName: "DnT,A" },
        { value: "dnTAKRoom", displayName: "DnT,A;k verblijfsruimte" },
        { value: "dnTAKArea", displayName: "DnT,A;k verblijfsgebied" },
        { value: "frequency", displayName: "Frequenties" }
    ];

    selectedColumn = new formattingSettings.ItemDropdown({
        name: "selectedColumn",
        displayName: "Kolom",
        items: TableColumnsStyleCardSettings.columns,
        value: TableColumnsStyleCardSettings.columns[0]
    });
    styles: Record<string, TableColumnStyleSettings> = {};
    labelColumnNames: string[] = [];
    singleValueColumnNames: Partial<Record<"dnTA" | "dnTAKRoom" | "dnTAKArea", string>> = {};
    visibleSingleValueKeys: Set<string> = new Set(["dnTA", "dnTAKRoom", "dnTAKArea"]);
    name = "tableColumns";
    displayName = "Tabellen - Kolommen";
    slices: Array<FormattingSettingsSlice> = [this.selectedColumn];

    constructor() {
        super();
        for (const column of TableColumnsStyleCardSettings.columns) {
            const prefix = column.value;
            const columnName = new formattingSettings.TextInput({
                name: `${prefix}ColumnName`,
                displayName: prefix === "frequency" ? "Kop boven frequenties" : "Kolomnaam",
                value: "",
                placeholder: prefix === "frequency" ? "DnT" : column.displayName
            });
            const alignment = new formattingSettings.AlignmentGroup({
                name: `${prefix}Alignment`,
                displayName: "Uitlijning",
                mode: powerbi.visuals.AlignmentGroupMode.Horizonal,
                value: prefix.startsWith("label") ? "left" : "center"
            });
            const fontFamily = new formattingSettings.FontPicker({ name: `${prefix}FontFamily`, displayName: "Lettertype", value: "Segoe UI" });
            const fontSize = new formattingSettings.NumUpDown({ name: `${prefix}FontSize`, displayName: "Tekstgrootte", value: 11 });
            const bold = new formattingSettings.ToggleSwitch({ name: `${prefix}Bold`, displayName: "Vet", value: false });
            const italic = new formattingSettings.ToggleSwitch({ name: `${prefix}Italic`, displayName: "Cursief", value: false });
            const underline = new formattingSettings.ToggleSwitch({ name: `${prefix}Underline`, displayName: "Onderstrepen", value: false });
            const fontControl = new formattingSettings.FontControl({ name: `${prefix}FontControl`, displayName: "Tekstopmaak", fontFamily, fontSize, bold, italic, underline });
            const color = new formattingSettings.ColorPicker({ name: `${prefix}Color`, displayName: prefix === "info" ? "Icoonkleur" : "Tekstkleur", value: { value: "#1f2937" } });
            const backgroundColor = new formattingSettings.ColorPicker({ name: `${prefix}BackgroundColor`, displayName: "Achtergrond", value: { value: "#ffffff" } });
            this.styles[prefix] = { columnName, alignment, fontControl, fontFamily, fontSize, bold, italic, underline, color, backgroundColor };
            this.slices.push(columnName, fontControl, alignment, color, backgroundColor);
        }
    }

    onPreProcess(): void {
        for (let index = 0; index < TableColumnsStyleCardSettings.labelColumnCount; index += 1) {
            TableColumnsStyleCardSettings.columns[index].displayName =
                this.labelColumnNames[index] || `Measurement ${index + 1}`;
        }
        TableColumnsStyleCardSettings.columns[11].displayName = this.singleValueColumnNames.dnTA || "DnT,A";
        TableColumnsStyleCardSettings.columns[12].displayName = this.singleValueColumnNames.dnTAKRoom || "DnT,A;k verblijfsruimte";
        TableColumnsStyleCardSettings.columns[13].displayName = this.singleValueColumnNames.dnTAKArea || "DnT,A;k verblijfsgebied";

        const availableColumns = TableColumnsStyleCardSettings.columns.filter((column, index) => {
            if (index < TableColumnsStyleCardSettings.labelColumnCount) {
                return index < this.labelColumnNames.length;
            }
            return !["dnTA", "dnTAKRoom", "dnTAKArea"].includes(column.value)
                || this.visibleSingleValueKeys.has(column.value);
        });
        if (availableColumns.length > 0) {
            this.selectedColumn.items = availableColumns;
            this.selectedColumn.value =
                availableColumns.find((column) => column.value === this.selectedColumn.value?.value) ?? availableColumns[0];
        }

        const selected = String(this.selectedColumn.value.value);
        for (const [key, style] of Object.entries(this.styles)) {
            style.columnName.visible = key === selected && key !== "info";
            style.fontControl.visible = key === selected && key !== "info";
            style.alignment.visible = key === selected;
            style.color.visible = key === selected;
            style.backgroundColor.visible = key === selected;
        }
    }

    getStyle(key: string): TableColumnStyleSettings {
        return this.styles[key];
    }
}

class TableSelectionStyleCardSettings extends FormattingSettingsCard {
    backgroundColor = new formattingSettings.ColorPicker({ name: "selectedRowBackgroundColor", displayName: "Achtergrondkleur", value: { value: "#3b82f6" } });
    transparency = new formattingSettings.NumUpDown({ name: "selectedRowTransparency", displayName: "Doorzichtigheid (%)", value: 75 });
    fontColor = new formattingSettings.ColorPicker({ name: "selectedRowFontColor", displayName: "Tekstkleur", value: { value: "#1f2937" } });
    name = "tableSelection";
    displayName = "Tabel - Selectie";
    slices: Array<FormattingSettingsSlice> = [this.backgroundColor, this.transparency, this.fontColor];
}

class TableLinesStyleCardSettings extends FormattingSettingsCard {
    horizontalColor = new formattingSettings.ColorPicker({ name: "tableHorizontalLineColor", displayName: "Horizontale lijnen kleur", value: { value: "#e5e7eb" } });
    horizontalWidth = new formattingSettings.NumUpDown({ name: "tableHorizontalLineWidth", displayName: "Horizontale lijnen dikte (px)", value: 1 });
    verticalColor = new formattingSettings.ColorPicker({ name: "tableVerticalLineColor", displayName: "Verticale lijnen kleur", value: { value: "#e5e7eb" } });
    verticalWidth = new formattingSettings.NumUpDown({ name: "tableVerticalLineWidth", displayName: "Verticale lijnen dikte (px)", value: 1 });
    name = "tableLines";
    displayName = "Lijnen";
    slices: Array<FormattingSettingsSlice> = [this.horizontalColor, this.horizontalWidth, this.verticalColor, this.verticalWidth];
}

class TableFormattingCardSettings extends FormattingSettingsCompositeCard {
    name = "tableFormatting";
    displayName = "Tabel";
    groups: Array<formattingSettings.Group>;
    private columnsCard: TableColumnsStyleCardSettings;

    constructor(cards: FormattingSettingsCard[]) {
        super();
        this.columnsCard = cards.find((card): card is TableColumnsStyleCardSettings => card instanceof TableColumnsStyleCardSettings)!;
        this.groups = cards.map((card) => new formattingSettings.Group({
            name: card.name,
            displayName: card.displayName?.replace("Tabellen - ", ""),
            collapsible: true,
            slices: card.slices
        }));
    }

    onPreProcess(): void {
        this.columnsCard.onPreProcess();
    }
}

class GraphXAxisCardSettings extends FormattingSettingsCard {
    title = new formattingSettings.TextInput({ name: "xTitle", displayName: "Titel", value: "Frequentie (f) [Hz]", placeholder: "Frequentie (f) [Hz]" });
    titleFontFamily = new formattingSettings.FontPicker({ name: "xTitleFontFamily", displayName: "Titel lettertype", value: "Segoe UI" });
    titleFontSize = new formattingSettings.NumUpDown({ name: "xTitleFontSize", displayName: "Titel tekstgrootte", value: 11 });
    titleBold = new formattingSettings.ToggleSwitch({ name: "xTitleBold", displayName: "Titel vet", value: false });
    titleItalic = new formattingSettings.ToggleSwitch({ name: "xTitleItalic", displayName: "Titel cursief", value: false });
    titleUnderline = new formattingSettings.ToggleSwitch({ name: "xTitleUnderline", displayName: "Titel onderstrepen", value: false });
    titleFontControl = new formattingSettings.FontControl({ name: "xTitleFontControl", displayName: "Titel opmaak", fontFamily: this.titleFontFamily, fontSize: this.titleFontSize, bold: this.titleBold, italic: this.titleItalic, underline: this.titleUnderline });
    titleColor = new formattingSettings.ColorPicker({ name: "xTitleColor", displayName: "Titel kleur", value: { value: "#45464A" } });
    labelFontFamily = new formattingSettings.FontPicker({ name: "xLabelFontFamily", displayName: "Label lettertype", value: "Segoe UI" });
    labelFontSize = new formattingSettings.NumUpDown({ name: "xLabelFontSize", displayName: "Label tekstgrootte", value: 10 });
    labelBold = new formattingSettings.ToggleSwitch({ name: "xLabelBold", displayName: "Labels vet", value: false });
    labelItalic = new formattingSettings.ToggleSwitch({ name: "xLabelItalic", displayName: "Labels cursief", value: false });
    labelUnderline = new formattingSettings.ToggleSwitch({ name: "xLabelUnderline", displayName: "Labels onderstrepen", value: false });
    labelFontControl = new formattingSettings.FontControl({ name: "xLabelFontControl", displayName: "Label opmaak", fontFamily: this.labelFontFamily, fontSize: this.labelFontSize, bold: this.labelBold, italic: this.labelItalic, underline: this.labelUnderline });
    labelColor = new formattingSettings.ColorPicker({ name: "xLabelColor", displayName: "Labelkleur", value: { value: "#606166" } });
    gridColor = new formattingSettings.ColorPicker({ name: "xGridColor", displayName: "Octaaflijnkleur", value: { value: "#ECECEF" } });
    lineWidth = new formattingSettings.NumUpDown({ name: "xLineWidth", displayName: "Octaaflijndikte", value: 1 });
    lineStyle = new formattingSettings.ItemDropdown({ name: "xLineStyle", displayName: "Octaaflijntype", items: GRAPH_LINE_STYLES, value: GRAPH_LINE_STYLES[0] });
    thirdGridColor = new formattingSettings.ColorPicker({ name: "xThirdGridColor", displayName: "Tertslijnkleur", value: { value: "#F6F6F7" } });
    thirdLineWidth = new formattingSettings.NumUpDown({ name: "xThirdLineWidth", displayName: "Tertslijndikte", value: 1 });
    thirdLineStyle = new formattingSettings.ItemDropdown({ name: "xThirdLineStyle", displayName: "Tertslijntype", items: GRAPH_LINE_STYLES, value: GRAPH_LINE_STYLES[0] });
    axisLineColor = new formattingSettings.ColorPicker({ name: "xAxisLineColor", displayName: "Aslijnkleur", value: { value: "#9A9AA0" } });
    axisLineWidth = new formattingSettings.NumUpDown({ name: "xAxisLineWidth", displayName: "Aslijndikte", value: 1 });
    name = "graphXAxis";
    displayName = "Grafiek x-as";
    slices: Array<FormattingSettingsSlice> = [this.title, this.titleFontControl, this.titleColor, this.labelFontControl, this.labelColor, this.axisLineColor, this.axisLineWidth, this.gridColor, this.lineWidth, this.lineStyle, this.thirdGridColor, this.thirdLineWidth, this.thirdLineStyle];
}

class GraphYAxisCardSettings extends FormattingSettingsCard {
    title = new formattingSettings.TextInput({ name: "yTitle", displayName: "Titel", value: "Genormaliseerde luchtgeluidisolatie (DnT) [dB]", placeholder: "Genormaliseerde luchtgeluidisolatie (DnT) [dB]" });
    titleFontFamily = new formattingSettings.FontPicker({ name: "yTitleFontFamily", displayName: "Titel lettertype", value: "Segoe UI" });
    titleFontSize = new formattingSettings.NumUpDown({ name: "yTitleFontSize", displayName: "Titel tekstgrootte", value: 11 });
    titleBold = new formattingSettings.ToggleSwitch({ name: "yTitleBold", displayName: "Titel vet", value: false });
    titleItalic = new formattingSettings.ToggleSwitch({ name: "yTitleItalic", displayName: "Titel cursief", value: false });
    titleUnderline = new formattingSettings.ToggleSwitch({ name: "yTitleUnderline", displayName: "Titel onderstrepen", value: false });
    titleFontControl = new formattingSettings.FontControl({ name: "yTitleFontControl", displayName: "Titel opmaak", fontFamily: this.titleFontFamily, fontSize: this.titleFontSize, bold: this.titleBold, italic: this.titleItalic, underline: this.titleUnderline });
    titleColor = new formattingSettings.ColorPicker({ name: "yTitleColor", displayName: "Titel kleur", value: { value: "#45464A" } });
    labelFontFamily = new formattingSettings.FontPicker({ name: "yLabelFontFamily", displayName: "Label lettertype", value: "Segoe UI" });
    labelFontSize = new formattingSettings.NumUpDown({ name: "yLabelFontSize", displayName: "Label tekstgrootte", value: 10 });
    labelBold = new formattingSettings.ToggleSwitch({ name: "yLabelBold", displayName: "Labels vet", value: false });
    labelItalic = new formattingSettings.ToggleSwitch({ name: "yLabelItalic", displayName: "Labels cursief", value: false });
    labelUnderline = new formattingSettings.ToggleSwitch({ name: "yLabelUnderline", displayName: "Labels onderstrepen", value: false });
    labelFontControl = new formattingSettings.FontControl({ name: "yLabelFontControl", displayName: "Label opmaak", fontFamily: this.labelFontFamily, fontSize: this.labelFontSize, bold: this.labelBold, italic: this.labelItalic, underline: this.labelUnderline });
    labelColor = new formattingSettings.ColorPicker({ name: "yLabelColor", displayName: "Labelkleur", value: { value: "#606166" } });
    gridColor = new formattingSettings.ColorPicker({ name: "yGridColor", displayName: "Lijnkleur", value: { value: "#E3E3E7" } });
    lineWidth = new formattingSettings.NumUpDown({ name: "yLineWidth", displayName: "Lijndikte", value: 1 });
    lineStyle = new formattingSettings.ItemDropdown({ name: "yLineStyle", displayName: "Lijntype", items: GRAPH_LINE_STYLES, value: GRAPH_LINE_STYLES[0] });
    axisLineColor = new formattingSettings.ColorPicker({ name: "yAxisLineColor", displayName: "Aslijnkleur", value: { value: "#9A9AA0" } });
    axisLineWidth = new formattingSettings.NumUpDown({ name: "yAxisLineWidth", displayName: "Aslijndikte", value: 1 });
    name = "graphYAxis";
    displayName = "Grafiek y-as";
    slices: Array<FormattingSettingsSlice> = [this.title, this.titleFontControl, this.titleColor, this.labelFontControl, this.labelColor, this.axisLineColor, this.axisLineWidth, this.gridColor, this.lineWidth, this.lineStyle];
}

class GraphPaddingCardSettings extends FormattingSettingsCard {
    leftPadding = new formattingSettings.NumUpDown({ name: "leftPadding", displayName: "Links (px)", value: 12 });
    titleGap = new formattingSettings.NumUpDown({ name: "titleGap", displayName: "Titelmarge (px)", value: 19 });
    showGuides = new formattingSettings.ToggleSwitch({ name: "showGraphGuides", displayName: "Hulplijnen tonen", value: false });
    rightPadding = new formattingSettings.NumUpDown({ name: "rightPadding", displayName: "Rechts (px)", value: 12 });
    topPadding = new formattingSettings.NumUpDown({ name: "topPadding", displayName: "Boven (px)", value: 8 });
    bottomPadding = new formattingSettings.NumUpDown({ name: "bottomPadding", displayName: "Onder (px)", value: 12 });
    name = "graphPadding";
    displayName = "Padding";
    slices: Array<FormattingSettingsSlice> = [this.leftPadding, this.titleGap, this.showGuides, this.rightPadding, this.topPadding, this.bottomPadding];
}

class GraphUnselectedCardSettings extends FormattingSettingsCard {
    lineWidth = new formattingSettings.NumUpDown({ name: "lineWidth", displayName: "Lijndikte", value: 1.15 });
    pointSize = new formattingSettings.NumUpDown({ name: "pointSize", displayName: "Puntgrootte", value: 22 });
    name = "graphUnselected";
    displayName = "Niet geselecteerd";
    slices: Array<FormattingSettingsSlice> = [this.lineWidth, this.pointSize];
}

class GraphSelectedCardSettings extends FormattingSettingsCard {
    selectedLineWidth = new formattingSettings.NumUpDown({ name: "selectedLineWidth", displayName: "Lijndikte", value: 2.4 });
    selectedPointSize = new formattingSettings.NumUpDown({ name: "selectedPointSize", displayName: "Puntgrootte", value: 40 });
    dimmedOpacity = new formattingSettings.NumUpDown({ name: "dimmedOpacity", displayName: "Dekking niet-geselecteerd", value: 0.28 });
    name = "graphSelected";
    displayName = "Geselecteerd";
    slices: Array<FormattingSettingsSlice> = [this.selectedLineWidth, this.selectedPointSize, this.dimmedOpacity];
}

class GraphFormattingCardSettings extends FormattingSettingsCompositeCard {
    name = "graphFormatting";
    displayName = "Grafiek";
    groups: Array<formattingSettings.Group>;

    constructor(cards: FormattingSettingsCard[]) {
        super();
        this.groups = cards.map((card) => new formattingSettings.Group({
            name: card.name,
            displayName: card.displayName,
            collapsible: true,
            slices: card.slices
        }));
    }
}

class ExtraDataTitleCardSettings extends FormattingSettingsCard {
    settingsTitle = new formattingSettings.TextInput({
        name: "extraDataSettingsTitle",
        displayName: "Titel instellingen",
        value: "Instellingen",
        placeholder: "Instellingen"
    });
    measurementDetailsTitle = new formattingSettings.TextInput({
        name: "extraDataMeasurementDetailsTitle",
        displayName: "Titel Measurement details",
        value: "Measurement details",
        placeholder: "Measurement details"
    });
    fontFamily = new formattingSettings.FontPicker({ name: "extraDataTitleFontFamily", displayName: "Lettertype", value: "Segoe UI" });
    fontSize = new formattingSettings.NumUpDown({ name: "extraDataTitleFontSize", displayName: "Tekstgrootte", value: 12 });
    bold = new formattingSettings.ToggleSwitch({ name: "extraDataTitleBold", displayName: "Vet", value: true });
    italic = new formattingSettings.ToggleSwitch({ name: "extraDataTitleItalic", displayName: "Cursief", value: false });
    underline = new formattingSettings.ToggleSwitch({ name: "extraDataTitleUnderline", displayName: "Onderstrepen", value: false });
    fontControl = new formattingSettings.FontControl({
        name: "extraDataTitleFontControl",
        displayName: "Tekstopmaak",
        fontFamily: this.fontFamily,
        fontSize: this.fontSize,
        bold: this.bold,
        italic: this.italic,
        underline: this.underline
    });
    color = new formattingSettings.ColorPicker({ name: "extraDataTitleColor", displayName: "Tekstkleur", value: { value: "#374151" } });
    backgroundColor = new formattingSettings.ColorPicker({ name: "extraDataTitleBackgroundColor", displayName: "Achtergrond", value: { value: "#f3f4f6" } });
    toggleColor = new formattingSettings.ColorPicker({ name: "extraDataToggleColor", displayName: "Kleur pijltje", value: { value: "#4b5563" } });
    name = "extraDataTitle";
    displayName = "Titel";
    slices: Array<FormattingSettingsSlice> = [this.settingsTitle, this.measurementDetailsTitle, this.fontControl, this.color, this.backgroundColor, this.toggleColor];
}

class ExtraDataColumnCardSettings extends FormattingSettingsCard {
    private static readonly columns = [
        { value: "description", displayName: "Omschrijving" },
        ...Array.from({ length: 10 }, (_, index) => ({ value: `detail${index}`, displayName: `Detail ${index + 1}` }))
    ];
    selectedColumn: formattingSettings.ItemDropdown;
    styles: Record<string, ReportTextStyleSettings> = {};
    columnNames: string[] = [];
    includeDecimals: boolean;

    constructor(name: string, displayName: string, prefix: string, background: string, includeDecimals: boolean = false) {
        super();
        this.includeDecimals = includeDecimals;
        this.name = name;
        this.displayName = displayName;
        this.selectedColumn = new formattingSettings.ItemDropdown({
            name: `${prefix}SelectedColumn`,
            displayName: "Kolom",
            items: ExtraDataColumnCardSettings.columns,
            value: ExtraDataColumnCardSettings.columns[0]
        });
        this.slices = [this.selectedColumn];
        for (const column of ExtraDataColumnCardSettings.columns) {
            const stylePrefix = column.value === "description"
                ? prefix
                : `${prefix}${column.value.charAt(0).toUpperCase()}${column.value.slice(1)}`;
            const style = new ReportTextStyleSettings(stylePrefix, "left", background, this.includeDecimals);
            this.styles[column.value] = style;
            this.slices.push(...style.slices);
        }
    }

    getStyle(key: string): ReportTextStyleSettings {
        return this.styles[key] || this.styles.description;
    }

    onPreProcess(): void {
        const items = ExtraDataColumnCardSettings.columns.filter((column) =>
            column.value === "description" || Number(column.value.slice(6)) < this.columnNames.length
        ).map((column) => {
            const index = column.value === "description" ? -1 : Number(column.value.slice(6));
            return index >= 0 ? { value: column.value, displayName: this.columnNames[index] || column.displayName } : column;
        });
        this.selectedColumn.items = items;
        this.selectedColumn.value = items.find((item) => item.value === this.selectedColumn.value?.value) ?? items[0];
        const selected = String(this.selectedColumn.value.value);
        for (const [key, style] of Object.entries(this.styles)) {
            style.slices.forEach((slice) => slice.visible = key === selected);
        }
    }
}

class ExtraDataFormattingCardSettings extends FormattingSettingsCompositeCard {
    name = "extraDataFormatting";
    displayName = "Extra data";
    groups: Array<formattingSettings.Group>;

    constructor(title: ExtraDataTitleCardSettings, headers: ExtraDataColumnCardSettings, values: ExtraDataColumnCardSettings) {
        super();
        this.groups = [new formattingSettings.Group({
            name: title.name,
            displayName: title.displayName,
            collapsible: true,
            slices: title.slices
        }), new formattingSettings.Group({
            name: headers.name,
            displayName: headers.displayName,
            collapsible: true,
            slices: headers.slices
        }), new formattingSettings.Group({
            name: values.name,
            displayName: values.displayName,
            collapsible: true,
            slices: values.slices
        })];
    }
}

class DebugCardSettings extends FormattingSettingsCard {
    showDebugTable = new formattingSettings.ToggleSwitch({
        name: "showDebugTable",
        displayName: "Debugtabel tonen",
        value: false
    });

    name = "debugStyle";
    displayName = "Debug";
    slices: Array<FormattingSettingsSlice> = [this.showDebugTable];
}

export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    generalStyleCard = new GeneralStyleCardSettings();
    windowTitleBarsCard = new WindowTitleBarsCardSettings();
    tableTitleStyleCard = new TableTitleStyleCardSettings();
    tableSpacingCard = new TableSpacingStyleCardSettings();
    reportTitleCard = new ReportTitleCardSettings();
    reportSpacingCard = new ReportSpacingCardSettings();
    reportLinesCard = new ReportLinesCardSettings();
    windowLinesCard = new WindowLinesCardSettings();
    reportTextCard = new ReportTextCardSettings();
    reportSummaryCard = new ReportSummaryCardSettings();
    topWindowColumnsCard = new TopWindowColumnsCardSettings();
    topWindowLinesCard = new TopWindowLinesCardSettings();
    reportFormattingCard = new ReportFormattingCardSettings(this.reportTitleCard, this.reportSpacingCard, this.reportLinesCard, this.reportTextCard, this.reportSummaryCard, this.windowLinesCard);
    tableColumnsCard = new TableColumnsStyleCardSettings();
    tableSelectionCard = new TableSelectionStyleCardSettings();
    tableLinesCard = new TableLinesStyleCardSettings();
    tableFormattingCard = new TableFormattingCardSettings([
        this.tableTitleStyleCard,
        this.tableSpacingCard,
        this.tableColumnsCard,
        this.tableSelectionCard,
        this.tableLinesCard
    ]);
    graphXAxisCard = new GraphXAxisCardSettings();
    graphYAxisCard = new GraphYAxisCardSettings();
    graphPaddingCard = new GraphPaddingCardSettings();
    graphUnselectedCard = new GraphUnselectedCardSettings();
    graphSelectedCard = new GraphSelectedCardSettings();
    graphFormattingCard = new GraphFormattingCardSettings([
        this.graphXAxisCard,
        this.graphYAxisCard,
        this.graphPaddingCard,
        this.graphUnselectedCard,
        this.graphSelectedCard
    ]);
    extraDataTitleCard = new ExtraDataTitleCardSettings();
    extraDataHeadersCard = new ExtraDataColumnCardSettings("extraDataHeaders", "Kolomkoppen", "extraDataHeader", "#f3f4f6");
    extraDataValuesCard = new ExtraDataColumnCardSettings("extraDataValues", "Waarden", "extraDataValue", "#ffffff", true);
    extraDataFormattingCard = new ExtraDataFormattingCardSettings(this.extraDataTitleCard, this.extraDataHeadersCard, this.extraDataValuesCard);
    debugCard = new DebugCardSettings();

    cards = [this.generalStyleCard, this.windowTitleBarsCard, this.tableFormattingCard, this.reportFormattingCard, this.topWindowColumnsCard, this.topWindowLinesCard, this.windowLinesCard, this.graphFormattingCard, this.extraDataFormattingCard, this.debugCard];
}

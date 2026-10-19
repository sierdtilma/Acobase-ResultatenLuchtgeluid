"use strict";

import powerbi from "powerbi-visuals-api";
import { valueFormatter } from "powerbi-visuals-utils-formattingutils";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";

import { ReportTextStyleSettings, VisualFormattingSettingsModel } from "./settings";

import DataView = powerbi.DataView;
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
import DataViewTable = powerbi.DataViewTable;
import ILocalizationManager = powerbi.extensibility.ILocalizationManager;
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import ISelectionId = powerbi.visuals.ISelectionId;
import ISelectionManager = powerbi.extensibility.ISelectionManager;

const SINGLE_VALUE_ROLES = ["dnTA", "dnTAKVerblijfsruimte", "dnTAKVerblijfsgebied"] as const;
const GRAPH_FREQUENCIES = [12.5, 16, 20, 25, 31.5, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 16000, 20000];
const FORMATTING_LABEL_KEYS: Record<string, string> = {
    "Algemeen": "Format_General",
    "Titelbalken": "Format_TitleBars",
    "Tabellen - Titel": "Format_TablesTitle",
    "Tabellen - Spacing": "Format_TablesSpacing",
    "Spacing": "Format_Spacing",
    "Lijnen": "Format_Lines",
    "Vensterlijnen": "Format_WindowLines",
    "Tekst": "Format_Text",
    "Bovenvenster - Kolommen": "Format_TopPanelColumns",
    "Bovenvenster - Lijnen": "Format_TopPanelLines",
    "Titel tonen": "Format_ShowTitle",
    "Titel": "Format_Title",
    "Titel instellingen": "Format_TitleSettings",
    "Titel Measurement details": "Format_MeasurementDetailsTitle",
    "Lettertype": "Format_FontFamily",
    "Titel lettertype": "Format_TitleFontFamily",
    "Tekstgrootte": "Format_FontSize",
    "Titel tekstgrootte": "Format_TitleFontSize",
    "Vet": "Format_Bold",
    "Titel vet": "Format_TitleBold",
    "Cursief": "Format_Italic",
    "Titel cursief": "Format_TitleItalic",
    "Onderstrepen": "Format_Underline",
    "Titel onderstrepen": "Format_TitleUnderline",
    "Tekstopmaak": "Format_FontControl",
    "Titel opmaak": "Format_TitleFormatting",
    "Tekstkleur": "Format_FontColor",
    "Titel kleur": "Format_TitleColor",
    "Achtergrond": "Format_Background",
    "Achtergrondkleur": "Format_BackgroundColor",
    "Decimalen": "Format_Decimals",
    "Doorzichtigheid (%)": "Format_Transparency",
    "Tabel": "Format_Table",
    "Tabellen": "Format_Tables",
    "Kolom": "Format_Column",
    "Uitlijning": "Format_Alignment",
    "Regelhoogte": "Format_RowHeight",
    "Verticale padding (px)": "Format_VerticalPadding",
    "Horizontale padding (px)": "Format_HorizontalPadding",
    "Celpadding koprijen (px)": "Format_HeaderCellPadding",
    "Celpadding metingrijen (px)": "Format_MeasurementCellPadding",
    "Celpadding detailrijen (px)": "Format_DetailCellPadding",
    "Rijhoogte frequenties (px)": "Format_FrequencyRowHeight",
    "Breedte Frequentie-kolom (px)": "Format_FrequencyColumnWidth",
    "Breedte metingkolommen (px)": "Format_MeasurementColumnWidth",
    "Kleur lijnen tussen octaafbanden": "Format_OctaveBandLineColor",
    "Dikte lijnen tussen octaafbanden (px)": "Format_OctaveBandLineWidth",
    "Kleur lijnen tussen resultaatrijen": "Format_ResultRowLineColor",
    "Dikte lijnen tussen resultaatrijen (px)": "Format_ResultRowLineWidth",
    "Kleur verticale lijnen": "Format_VerticalLineColor",
    "Dikte verticale lijnen (px)": "Format_VerticalLineWidth",
    "Rapporttabel lijn tonen": "Format_ReportLineVisible",
    "Rapporttabel kleur": "Format_ReportLineColor",
    "Rapporttabel dikte (px)": "Format_ReportLineWidth",
    "Grafiek lijn tonen": "Format_GraphLineVisible",
    "Grafiek kleur": "Format_GraphLineColor",
    "Grafiek dikte (px)": "Format_GraphLineWidth",
    "Resultatentabel lijn tonen": "Format_ResultTableLineVisible",
    "Resultatentabel kleur": "Format_ResultTableLineColor",
    "Resultatentabel dikte (px)": "Format_ResultTableLineWidth",
    "Zijpaneel lijn tonen": "Format_SidePanelLineVisible",
    "Zijpaneel kleur": "Format_SidePanelLineColor",
    "Zijpaneel dikte (px)": "Format_SidePanelLineWidth",
    "Frequentie": "Format_Frequency",
    "Frequenties": "Format_Frequencies",
    "Meting": "Format_Measurement",
    "Metingen": "Format_Measurements",
    "Omschrijving": "Format_Description",
    "Toelichting": "Format_Explanation",
    "Rapport": "Format_Report",
    "Rapporttabel": "Format_ReportTable",
    "Grafiek": "Format_Graph",
    "Kleur": "Format_Color",
    "Breedte": "Format_Width",
    "Hoogte": "Format_Height",
    "Rij": "Format_Row",
    "DnT,A": "Format_DnTA",
    "DnT,A;k VR": "Format_DnTAKRoomShort",
    "DnT,A;k VG": "Format_DnTAKAreaShort",
    "Info": "Format_Info",
    "DnT,A;k verblijfsruimte": "Format_DnTAKRoom",
    "DnT,A;k verblijfsgebied": "Format_DnTAKArea",
    "Tabellen - Kolommen": "Format_TablesColumns",
    "Tabel - Selectie": "Format_TableSelection",
    "Achtergrond kolomkop": "Format_ColumnHeaderBackground",
    "Horizontale lijnkleur": "Format_HorizontalLineColor",
    "Horizontale lijndikte (px)": "Format_HorizontalLineWidth",
    "Verticale lijnkleur": "Format_VerticalLineColor",
    "Verticale lijndikte (px)": "Format_VerticalLineWidth",
    "Horizontale lijnen kleur": "Format_HorizontalLinesColor",
    "Horizontale lijnen dikte (px)": "Format_HorizontalLinesWidth",
    "Verticale lijnen kleur": "Format_VerticalLinesColor",
    "Verticale lijnen dikte (px)": "Format_VerticalLinesWidth",
    "Grafiek x-as": "Format_GraphXAxis",
    "Grafiek y-as": "Format_GraphYAxis",
    "Label lettertype": "Format_LabelFontFamily",
    "Label tekstgrootte": "Format_LabelFontSize",
    "Labels vet": "Format_LabelsBold",
    "Labels cursief": "Format_LabelsItalic",
    "Labels onderstrepen": "Format_LabelsUnderline",
    "Label opmaak": "Format_LabelFormatting",
    "Labelkleur": "Format_LabelColor",
    "Octaaflijnkleur": "Format_OctaveLineColor",
    "Octaaflijndikte": "Format_OctaveLineWidth",
    "Octaaflijntype": "Format_OctaveLineStyle",
    "Tertslijnkleur": "Format_ThirdLineColor",
    "Tertslijndikte": "Format_ThirdLineWidth",
    "Tertslijntype": "Format_ThirdLineStyle",
    "Aslijnkleur": "Format_AxisLineColor",
    "Aslijndikte": "Format_AxisLineWidth",
    "Lijnkleur": "Format_LineColor",
    "Lijndikte": "Format_LineWidth",
    "Lijntype": "Format_LineStyle",
    "Links (px)": "Format_LeftPadding",
    "Rechts (px)": "Format_RightPadding",
    "Boven (px)": "Format_TopPadding",
    "Onder (px)": "Format_BottomPadding",
    "Titelmarge (px)": "Format_TitleGap",
    "Hulplijnen tonen": "Format_ShowGuides",
    "Padding": "Format_Padding",
    "Niet geselecteerd": "Format_Unselected",
    "Geselecteerd": "Format_Selected",
    "Puntgrootte": "Format_PointSize",
    "Dekking niet-geselecteerd": "Format_UnselectedOpacity",
    "Kleur pijltje": "Format_ToggleColor",
    "Extra data": "Format_ExtraData",
    "Debugtabel tonen": "Format_ShowDebugTable",
    "Debug": "Format_Debug",
    "Doorgetrokken": "Format_LineSolid",
    "Gestreept": "Format_LineDashed",
    "Gestippeld": "Format_LineDotted"
};
type GraphFrequencyMode = "available" | "extended" | "custom";

interface RoleIndexes {
    meting: number[];
    frequency: number;
    dnT: number;
    singleValues: Map<string, number>;
    columnVisibility: number;
    detail: number[];
    measurementDetails: number[];
    topDetails: number[];
    warning: number[];
}

interface ParsedRow {
    sourceIndex: number;
    metingValues: Map<number, string>;
    frequency: string;
    dnT: string;
    singleValues: Map<string, string>;
    detailValues: Map<number, string>;
    measurementDetailValues: Map<number, string>;
    topDetailValues: Map<number, string>;
    warningValues: Map<number, string>;
}

interface MetingLabelColumnDef {
    colIndex: number | null;
    header: string;
    colorSourceColIndex: number | null;
}

interface SingleValueColumnDef {
    role: string;
    label: string;
}

interface ReportFrequencyRow {
    groupKey: number;
    slot: number;
    frequency: string | null;
    displayFrequency: string;
}

interface RowDefinition {
    role: string;
    label: string;
    selector: (row: ParsedRow) => string;
}

interface MetingView {
    metingKey: string;
    selectionId: ISelectionId;
    labelParts: { header: string; text: string; swatchColorHex: string | null }[];
    singleValues: Map<string, string>;
    measurementDetails: Map<number, string>;
    topDetails: Map<number, string>;
    warnings: string[];
    frequencies: string[];
    matrix: Map<string, string>;
}

interface MeasurementDetailRow {
    metingKey: string;
    description: string;
    values: Map<number, string>;
}

interface GraphSeries {
    key: string;
    label: string;
    color: string;
    selectionId: ISelectionId;
    points: { hz: number; value: number }[];
}

interface RenderCycle {
    options: VisualUpdateOptions;
    frames: Set<number>;
    synchronous: boolean;
    completed: boolean;
}

export class Visual implements IVisual {
    private static readonly VisualVersion = "1.0.1.189";
    private static readonly DntVisibilityStorageKey = "resultatenluchtgeluid.dntVisibility";
    private static readonly ExtraTableBottomMargin = 2;
    private static readonly PaneGap = 10;

    private host: IVisualHost;
    private selectionManager: ISelectionManager;
    private container: HTMLElement;
    private formattingSettingsService: FormattingSettingsService;
    private formattingSettings: VisualFormattingSettingsModel;
    private localizationManager: ILocalizationManager;
    private locale: string;
    private lastUpdateOptions: VisualUpdateOptions | null = null;
    private settingsOpen: boolean = false;
    private settingsOutsideClickHandler: ((event: Event) => void) | null = null;
    private expandedMetingKeys: Set<string> = new Set<string>();
    private showDnTOverview: boolean = true;
    private showReportTable: boolean = true;
    private showTopPanel: boolean = true;
    private reportViewActive: boolean = true;
    private analysisViewActive: boolean = false;
    private showGraphPlaceholder: boolean = true;
    private showGraphSettingsPanel: boolean = true;
    private graphSettingsOpen: boolean = false;
    private selectedGraphSeries: Set<string> = new Set<string>();
    private paneHeights: Map<string, number> = new Map<string, number>();
    private previousResizablePane: { key: string; defaultHeight: number } | null = null;
    private viewportHeight: number = 0;
    private viewportWidth: number = 0;
    private initialTableFitPending: boolean = false;
    private measurementDetailColumns: Array<{ colIndex: number; label: string; source: DataViewMetadataColumn }> = [];
    private measurementDescriptionSource: DataViewMetadataColumn | undefined;
    private measurementDetailRows: MeasurementDetailRow[] = [];
    private debugTableVisible: boolean = false;
    private debugTableVisibilityInitialized: boolean = false;
    private graphSettingsSplitRatio: number = 0.3;
    private visibleSingleValueRoles: Set<string> = new Set(SINGLE_VALUE_ROLES);
    private sortLabelIndex: number | null = null;
    private sortAscending: boolean = true;
    private graphFrequencyMode: GraphFrequencyMode = "available";
    private graphFrequencyStart: number = 50;
    private graphFrequencyEnd: number = 5000;
    private renderCycle: RenderCycle | null = null;

    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.selectionManager = options.host.createSelectionManager();
        this.localizationManager = options.host.createLocalizationManager();
        this.locale = options.host.locale;
        this.formattingSettingsService = new FormattingSettingsService(this.localizationManager);
        this.formattingSettings = new VisualFormattingSettingsModel();

        this.container = document.createElement("div");
        this.container.className = "rlg-matrix";
        this.bindContextMenu(this.container);
        options.element.appendChild(this.container);
    }

    private bindContextMenu(element: Element, selectionId: ISelectionId | Record<string, never> = {}): void {
        element.addEventListener("contextmenu", (event: MouseEvent) => {
            event.preventDefault();
            event.stopPropagation();
            this.selectionManager.showContextMenu(selectionId, { x: event.clientX, y: event.clientY });
        });
    }

    private localize(key: string): string {
        return this.localizationManager.getDisplayName(key);
    }

    private localizeFormattingLabels(): void {
        const visited = new Set<object>();
        const apply = (value: unknown): void => {
            if (value === null || typeof value !== "object" || visited.has(value)) {
                return;
            }
            visited.add(value);
            const entity = value as { displayName?: unknown; displayNameKey?: string };
            if (typeof entity.displayName === "string" && FORMATTING_LABEL_KEYS[entity.displayName]) {
                entity.displayNameKey = FORMATTING_LABEL_KEYS[entity.displayName];
            } else if (typeof entity.displayName === "string" && /^Detail \d+$/.test(entity.displayName)) {
                entity.displayNameKey = "Format_Detail";
            }
            Object.values(value).forEach(apply);
        };
        apply(this.formattingSettings);
    }

    private bindKeyboardActivation(element: HTMLElement, action: (event: KeyboardEvent) => void): void {
        element.addEventListener("keydown", (event: KeyboardEvent) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                action(event);
            }
        });
    }

    private applyAccessibilityTheme(): void {
        const palette = this.host.colorPalette;
        const highContrast = palette.isHighContrast;
        this.container.classList.toggle("rlg-high-contrast", highContrast);
        if (highContrast) {
            this.container.style.setProperty("--rlg-hc-foreground", palette.foreground.value);
            this.container.style.setProperty("--rlg-hc-background", palette.background.value);
            this.container.style.setProperty("--rlg-hc-selected", palette.foregroundSelected.value);
        }
    }

    public update(options: VisualUpdateOptions): void {
        if (this.renderCycle && !this.renderCycle.completed) {
            this.failRender(this.renderCycle, new Error("Rendering superseded by a newer update."));
        }
        const cycle: RenderCycle = { options, frames: new Set(), synchronous: true, completed: false };
        this.renderCycle = cycle;
        this.host.eventService.renderingStarted(options);
        try {
            this.render(options);
        } catch (error) {
            this.failRender(cycle, error);
        } finally {
            cycle.synchronous = false;
            this.finishRender(cycle);
        }
    }

    private finishRender(cycle: RenderCycle): void {
        if (!cycle.completed && !cycle.synchronous && cycle.frames.size === 0) {
            cycle.completed = true;
            this.host.eventService.renderingFinished(cycle.options);
        }
    }

    private failRender(cycle: RenderCycle, error: unknown): void {
        if (cycle.completed) {
            return;
        }
        cycle.completed = true;
        for (const frame of cycle.frames) {
            cancelAnimationFrame(frame);
        }
        cycle.frames.clear();
        this.host.eventService.renderingFailed(cycle.options, error instanceof Error ? error.message : String(error));
    }

    private scheduleLayout(callback: FrameRequestCallback): void {
        const cycle = this.renderCycle;
        const frame = requestAnimationFrame((time) => {
            cycle?.frames.delete(frame);
            if (cycle !== this.renderCycle) {
                return;
            }
            try {
                callback(time);
            } catch (error) {
                if (cycle && !cycle.completed) {
                    this.failRender(cycle, error);
                }
            } finally {
                if (cycle) {
                    this.finishRender(cycle);
                }
            }
        });
        if (cycle && !cycle.completed) {
            cycle.frames.add(frame);
        }
    }

    public destroy(): void {
        if (this.renderCycle && !this.renderCycle.completed) {
            this.failRender(this.renderCycle, new Error("Visual destroyed during rendering."));
        }
        this.renderCycle = null;
        this.detachSettingsOutsideClickHandler();
        this.container.remove();
    }

    private render(options: VisualUpdateOptions): void {
        this.detachSettingsOutsideClickHandler();
        this.locale = this.host.locale || "en-US";
        this.applyAccessibilityTheme();
        this.lastUpdateOptions = options;
        this.viewportHeight = options.viewport.height;
        this.viewportWidth = options.viewport.width;
        this.paneHeights.delete("graph");
        this.measurementDetailColumns = [];
        this.measurementDescriptionSource = undefined;
        this.measurementDetailRows = [];
        const dataView: DataView | undefined = options.dataViews?.[0];
        this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(
            VisualFormattingSettingsModel,
            dataView
        );
        this.formattingSettings.topWindowColumnsCard.detailColumnNames = (dataView?.table?.columns || [])
            .filter((column) => Boolean(column.roles?.topDetails))
            .map((column) => column.displayName);
        const extraDataColumnNames = [
            ...(dataView?.table?.columns || []).filter((column) => Boolean(column.roles?.topDetails)),
            ...(dataView?.table?.columns || []).filter((column) => Boolean(column.roles?.measurementDetails))
        ].map((column) => column.displayName);
        this.formattingSettings.extraDataHeadersCard.columnNames = extraDataColumnNames;
        this.formattingSettings.extraDataValuesCard.columnNames = extraDataColumnNames;
        this.formattingSettings.extraDataHeadersCard.onPreProcess();
        this.formattingSettings.extraDataValuesCard.onPreProcess();
        const dataColumns = dataView?.table?.columns || [];
        this.formattingSettings.tableColumnsCard.singleValueColumnNames = {
            dnTA: dataColumns.find((column) => column.roles?.dnTA)?.displayName,
            dnTAKRoom: dataColumns.find((column) => column.roles?.dnTAKVerblijfsruimte)?.displayName,
            dnTAKArea: dataColumns.find((column) => column.roles?.dnTAKVerblijfsgebied)?.displayName
        };
        this.formattingSettings.tableColumnsCard.onPreProcess();
        const persistedVisibility = this.getPersistedVisibility(dataView);
        this.showDnTOverview = persistedVisibility.showDnTOverview ?? this.showDnTOverview;
        this.showReportTable = persistedVisibility.showReportTable ?? this.showReportTable;
        this.showTopPanel = persistedVisibility.showTopPanel ?? this.showTopPanel;
        this.reportViewActive = persistedVisibility.reportViewActive ?? this.reportViewActive;
        this.analysisViewActive = persistedVisibility.analysisViewActive ?? this.analysisViewActive;
        this.showGraphPlaceholder = persistedVisibility.showGraphPlaceholder ?? this.showGraphPlaceholder;
        this.showGraphSettingsPanel = persistedVisibility.showGraphSettingsPanel ?? this.showGraphSettingsPanel;
        this.graphSettingsOpen = persistedVisibility.graphSettingsOpen ?? this.graphSettingsOpen;
        this.debugTableVisible = persistedVisibility.debugTableVisible ?? this.debugTableVisible;
        this.graphFrequencyMode = persistedVisibility.graphFrequencyMode ?? this.graphFrequencyMode;
        this.graphFrequencyStart = persistedVisibility.graphFrequencyStart ?? this.graphFrequencyStart;
        this.graphFrequencyEnd = persistedVisibility.graphFrequencyEnd ?? this.graphFrequencyEnd;
        if (!this.debugTableVisibilityInitialized) {
            if (persistedVisibility.debugTableVisible === undefined) {
                this.debugTableVisible = this.formattingSettings.debugCard.showDebugTable.value;
            }
            this.debugTableVisibilityInitialized = true;
        }
        this.applyStyleSettings();

        this.container.replaceChildren();

        const workspaceNode = document.createElement("div");
        workspaceNode.className = "rlg-workspace";

        const contentNode = document.createElement("div");
        contentNode.className = "rlg-content";
        this.previousResizablePane = null;
        workspaceNode.appendChild(contentNode);
        if (this.showGraphSettingsPanel) {
            workspaceNode.appendChild(this.renderGraphSettingsPanel());
        }
        this.container.appendChild(workspaceNode);
        this.container.appendChild(this.renderFooter());

        const table = dataView?.table;
        const showDebugTable = this.debugTableVisible;

        if (showDebugTable && table) {
            this.appendResizablePane(contentNode, "debug", this.renderDebugCard(table), 220);
        }

        if (!table || !table.columns || table.columns.length === 0 || !table.rows || table.rows.length === 0) {
            this.renderEmpty(this.localize("UI_NoData"), contentNode);
            return;
        }
        if (table.columns.some((column) => !column.displayName?.trim())) {
            this.renderEmpty(this.localize("UI_InvalidMetadata"), contentNode);
            return;
        }

        const roleIndexes = this.getRoleIndexes(table.columns);
        if (!roleIndexes) {
            this.renderEmpty(
                this.localize("UI_MissingFields"),
                contentNode
            );
            return;
        }
        this.visibleSingleValueRoles = this.getVisibleSingleValueRoles(table, roleIndexes.columnVisibility);

        const allLabelColumnDefs = this.buildMetingLabelColumnDefs(table, roleIndexes);
        const labelColumnDefs = allLabelColumnDefs.filter(
            (def) => this.visibleSingleValueRoles.has("info") || !this.isToelichtingColumn(def.header)
        );
        this.formattingSettings.tableColumnsCard.labelColumnNames = labelColumnDefs.map((def) => def.header);
        this.formattingSettings.tableColumnsCard.visibleSingleValueKeys = new Set(
            SINGLE_VALUE_ROLES
                .filter((role) => this.visibleSingleValueRoles.has(role))
                .map((role) => this.getSingleValueStyleKey(role))
        );
        this.formattingSettings.tableColumnsCard.onPreProcess();

        const rows = this.parseRows(table, roleIndexes);
        if (rows.length === 0) {
            this.renderEmpty(this.localize("UI_NoValidRows"), contentNode);
            return;
        }

        const rowDefinitions: RowDefinition[] = [];
        if (roleIndexes.dnT >= 0) {
            rowDefinitions.push({
                role: "dnT",
                label: table.columns[roleIndexes.dnT].displayName,
                selector: (r) => r.dnT
            });
        }
        for (const colIndex of roleIndexes.detail) {
            rowDefinitions.push({
                role: `detail-${colIndex}`,
                label: table.columns[colIndex].displayName,
                selector: (r) => r.detailValues.get(colIndex) || ""
            });
        }

        const metingResult = this.buildMetingViews(table, rows, rowDefinitions, labelColumnDefs, roleIndexes.meting);
        if (metingResult.conflictError) {
            this.renderEmpty(`${this.localize("UI_InconsistentMeasurements")}: ${metingResult.conflictError}`, contentNode);
            return;
        }

        const metingViews = metingResult.views;
        if (this.sortLabelIndex !== null) {
            const sortIndex = this.sortLabelIndex;
            const direction = this.sortAscending ? 1 : -1;
            metingViews.sort((left, right) => direction * (left.labelParts[sortIndex]?.text || "")
                .localeCompare(right.labelParts[sortIndex]?.text || "", this.locale, { numeric: true, sensitivity: "base" }));
        }
        if (metingViews.length === 0) {
            this.renderEmpty(this.localize("UI_NoValues"), contentNode);
            return;
        }

        const allMeasurementDetailIndexes = [...roleIndexes.topDetails, ...roleIndexes.measurementDetails];
        const descriptionColumnIndex = labelColumnDefs[0]?.colIndex ?? roleIndexes.meting[0];
        this.measurementDescriptionSource = table.columns[descriptionColumnIndex];
        this.measurementDetailColumns = allMeasurementDetailIndexes.map((colIndex) => ({
            colIndex,
            label: table.columns[colIndex].displayName,
            source: table.columns[colIndex]
        }));
        this.measurementDetailRows = metingViews.map((view) => ({
            metingKey: view.metingKey,
            description: view.labelParts[0]?.text || view.metingKey,
            values: new Map([...view.measurementDetails, ...view.topDetails])
        }));
        this.refreshMeasurementDetailsTable(workspaceNode);

        if (this.formattingSettings.generalStyleCard.titleVisible.value) {
            const titleText = this.formattingSettings.generalStyleCard.titleText.value;
            const titleNode = document.createElement("div");
            titleNode.className = "rlg-title";
            this.appendHtmlRichText(titleNode, titleText);
            contentNode.appendChild(titleNode);
        }

        const dnTIndex = rowDefinitions.findIndex((rowDefinition) => rowDefinition.role === "dnT");
        const singleValueColumns: SingleValueColumnDef[] = [];
        for (const role of SINGLE_VALUE_ROLES) {
            const colIndex = roleIndexes.singleValues.get(role) ?? -1;
            if (colIndex >= 0 && this.visibleSingleValueRoles.has(role)) {
                singleValueColumns.push({
                    role,
                    label: table.columns[colIndex].displayName
                });
            }
        }
        this.appendResizablePane(
            contentNode,
            "graph",
            this.renderGraphPaneWithSettings(metingViews, rowDefinitions[dnTIndex]),
            this.getAvailableGraphPlotHeight(metingViews.length)
        );
        if (this.showDnTOverview) {
            if (dnTIndex >= 0) {
                try {
                    this.appendResizablePane(
                        contentNode,
                        "table",
                        this.renderDnTOverviewCard(
                            metingViews,
                            rowDefinitions,
                            dnTIndex,
                            labelColumnDefs,
                            singleValueColumns
                        ),
                        this.getDefaultTableHeight(metingViews.length)
                    );
                } catch (error) {
                    const errorHint = document.createElement("div");
                    errorHint.className = "rlg-hint";
                    errorHint.textContent = `${this.localize("UI_TableRenderError")}: ${error instanceof Error ? error.message : String(error)}`;
                    contentNode.appendChild(errorHint);
                }
            } else {
                const hint = document.createElement("div");
                hint.className = "rlg-hint";
                hint.textContent = this.localize("UI_ConnectDnTForTable");
                contentNode.appendChild(hint);
            }
        }

        this.scheduleLayout(() => this.syncGraphSettingsPanelBounds(workspaceNode));
        this.scheduleLayout(() => this.syncTopPanelBounds(workspaceNode));
        this.fitInitialTableHeight();
    }

    private syncTopPanelBounds(workspace: HTMLElement): void {
        const topPanel = workspace.querySelector<HTMLElement>(".rlg-graph-top-panel");
        const contentRow = workspace.querySelector<HTMLElement>(".rlg-graph-content-row");
        if (!topPanel || !contentRow) {
            return;
        }
        const workspaceRect = workspace.getBoundingClientRect();
        const rowRect = contentRow.getBoundingClientRect();
        topPanel.style.marginLeft = `${Math.max(0, rowRect.left - workspaceRect.left)}px`;
        topPanel.style.width = `${rowRect.width}px`;
    }

    private syncGraphSettingsPanelBounds(workspace: HTMLElement): void {
        const settingsPanel = workspace.querySelector<HTMLElement>(".rlg-graph-settings-panel");
        if (!settingsPanel) {
            return;
        }

        const graphPane = workspace.querySelector<HTMLElement>("[data-pane-key=\"graph\"]");
        if (!graphPane) {
            settingsPanel.hidden = true;
            return;
        }

        const workspaceRect = workspace.getBoundingClientRect();
        const graphRect = graphPane.getBoundingClientRect();
        const graphCard = graphPane.querySelector<HTMLElement>(".rlg-graph-card");
        const openWidth = graphCard
            ? Math.max(36, workspaceRect.right - graphCard.getBoundingClientRect().right - Visual.PaneGap)
            : Math.max(36, workspaceRect.width / 2);
        settingsPanel.hidden = false;
        settingsPanel.style.top = `${Math.max(0, graphRect.top - workspaceRect.top)}px`;
        settingsPanel.style.height = `${graphRect.height}px`;
        settingsPanel.style.setProperty("--rlg-settings-open-width", `${openWidth}px`);
    }

    private renderFooter(): HTMLElement {
        const footer = document.createElement("div");
        footer.className = "rlg-footer";

        const settingsButton = document.createElement("button");
        settingsButton.className = "rlg-settings-button";
        settingsButton.type = "button";
        settingsButton.title = this.localize("UI_Settings");
        settingsButton.setAttribute("aria-label", settingsButton.title);
        settingsButton.addEventListener("click", () => {
            this.settingsOpen = !this.settingsOpen;
            const existingPanel = footer.querySelector<HTMLElement>(".rlg-settings-panel");
            if (this.settingsOpen && !existingPanel) {
                footer.appendChild(this.renderMainSettingsPanel());
                this.scheduleLayout(() => this.attachSettingsOutsideClickHandler(footer));
            } else if (!this.settingsOpen) {
                existingPanel?.remove();
                this.detachSettingsOutsideClickHandler();
            }
        });
        footer.appendChild(settingsButton);

        if (this.settingsOpen) {
            footer.appendChild(this.renderMainSettingsPanel());
        }

        if (this.settingsOpen) {
            this.attachSettingsOutsideClickHandler(footer);
        }

        return footer;
    }

    private attachSettingsOutsideClickHandler(footer: HTMLElement): void {
        this.detachSettingsOutsideClickHandler();
        const closeOnOutsideClick = (event: Event): void => {
            if (!footer.isConnected || !footer.contains(event.target as Node)) {
                this.settingsOpen = false;
                footer.querySelector<HTMLElement>(".rlg-settings-panel")?.remove();
                this.detachSettingsOutsideClickHandler();
            }
        };
        this.settingsOutsideClickHandler = closeOnOutsideClick;
        document.addEventListener("pointerdown", closeOnOutsideClick, true);
    }

    private detachSettingsOutsideClickHandler(): void {
        if (this.settingsOutsideClickHandler) {
            document.removeEventListener("pointerdown", this.settingsOutsideClickHandler, true);
            this.settingsOutsideClickHandler = null;
        }
    }

    private renderVersionBadge(): HTMLElement {
        const version = document.createElement("span");
        version.className = "rlg-version";
        version.textContent = `v${Visual.VisualVersion}`;
        return version;
    }

    private renderMainSettingsPanel(): HTMLElement {
        const panel = document.createElement("div");
        panel.className = "rlg-settings-panel";

        panel.appendChild(this.renderSettingCheckbox(this.getTableVisibilityLabel(), this.showDnTOverview, (checked) => {
            this.setInstanceVisibility("showDnTOverview", checked);
        }));
        panel.appendChild(this.renderSettingCheckbox(this.localize("UI_ShowReportTable"), this.showReportTable, (checked) => {
            this.setInstanceVisibility("showReportTable", checked);
        }));
        panel.appendChild(this.renderSettingCheckbox(this.localize("UI_ShowTopPanel"), this.showTopPanel, (checked) => {
            this.setInstanceVisibility("showTopPanel", checked);
        }));
        panel.appendChild(this.renderSettingCheckbox(this.localize("UI_ShowGraph"), this.showGraphPlaceholder, (checked) => {
            this.setInstanceVisibility("showGraphPlaceholder", checked);
        }));
        panel.appendChild(this.renderSettingCheckbox(this.localize("UI_ShowSettingsPanel"), this.showGraphSettingsPanel, (checked) => {
            this.setInstanceVisibility("showGraphSettingsPanel", checked);
        }));
        panel.appendChild(this.renderSettingCheckbox(this.localize("UI_ShowDebug"), this.debugTableVisible, (checked) => {
            this.setInstanceVisibility("debugTableVisible", checked);
        }));

        return panel;
    }

    private renderGraphPaneWithSettings(metingViews: MetingView[], dnTDefinition: RowDefinition | undefined): HTMLElement {
        const graphPane = document.createElement("div");
        graphPane.className = "rlg-graph-pane";

        const graphContent = document.createElement("div");
        graphContent.className = "rlg-graph-content";

        if (this.showTopPanel) {
            const topPanel = document.createElement("aside");
            topPanel.className = "rlg-graph-top-panel";
            topPanel.setAttribute("aria-label", this.localize("UI_AdditionalPanel"));
            topPanel.appendChild(this.renderTopMeasurementsTable(metingViews));
            graphContent.appendChild(topPanel);
        }

        const graphRow = document.createElement("div");
        graphRow.className = "rlg-graph-content-row";

        if (this.showReportTable) {
            const leftPanel = document.createElement("aside");
            leftPanel.className = "rlg-graph-left-panel";
            leftPanel.setAttribute("aria-label", this.localize("UI_AdditionalPanel"));
            const fixedReportWidth = this.getFourMeasurementReportWidth();
            leftPanel.style.width = `${fixedReportWidth}px`;
            leftPanel.style.minWidth = `${fixedReportWidth}px`;
            leftPanel.style.maxWidth = `${fixedReportWidth}px`;
            if (metingViews.length > 4) {
                const message = document.createElement("div");
                message.className = "rlg-report-table-limit-message";
                message.textContent = this.localize("UI_MaxReportMeasurements");
                leftPanel.appendChild(message);
            } else {
                leftPanel.appendChild(this.renderReportTable(
                    metingViews,
                    dnTDefinition
                ));
            }
            graphRow.appendChild(leftPanel);
        }

        if (this.showGraphPlaceholder) {
            const chartPanel = document.createElement("div");
            chartPanel.className = "rlg-graph-chart";
            chartPanel.style.width = "fit-content";
            chartPanel.style.maxWidth = "100%";
            chartPanel.appendChild(this.renderGraph(metingViews, dnTDefinition));
            graphRow.appendChild(chartPanel);
        }
        graphContent.appendChild(graphRow);
        graphPane.appendChild(graphContent);
        return graphPane;
    }

    private getFourMeasurementReportWidth(): number {
        const spacing = this.formattingSettings.reportSpacingCard;
        const lines = this.formattingSettings.reportLinesCard;
        const windowLines = this.formattingSettings.windowLinesCard;
        const columnCount = 5;
        const cellHorizontalPadding = 12;
        const tableBorders = (columnCount + 1) * Math.max(0, lines.verticalWidth.value);
        const panelBorders = windowLines.reportVisible.value ? 2 * Math.max(0, windowLines.reportWidth.value) : 0;
        return Math.ceil(
            Math.max(1, spacing.frequencyColumnWidth.value)
            + 4 * Math.max(1, spacing.measurementColumnWidth.value)
            + columnCount * cellHorizontalPadding
            + tableBorders
            + panelBorders
        );
    }

    private renderTopMeasurementsTable(metingViews: MetingView[]): HTMLElement {
        const table = document.createElement("table");
        table.className = "rlg-top-measurements-table";
        const topDetailColumns = this.lastUpdateOptions?.dataViews?.[0]?.table?.columns
            .map((column, index) => ({ column, index }))
            .filter(({ column }) => Boolean(column.roles?.topDetails)) || [];
        const toelichtingVisible = this.visibleSingleValueRoles.has("info");
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        const topHeaders = [this.localize("Format_Measurement"), this.localize("Format_Description"), ...(toelichtingVisible ? [this.localize("Format_Explanation")] : []), ...topDetailColumns.map(({ column }) => column.displayName)];
        for (const [headerIndex, label] of topHeaders.entries()) {
            const header = document.createElement("th");
            header.className = `rlg-top-column-${headerIndex === 0 ? "measurement" : headerIndex === 1 ? "description" : headerIndex === 2 && toelichtingVisible ? "toelichting" : `detail${headerIndex - (toelichtingVisible ? 3 : 2)}`}`;
            this.appendHtmlRichText(header, label);
            headerRow.appendChild(header);
        }
        thead.appendChild(headerRow);
        table.appendChild(thead);
        const tbody = document.createElement("tbody");
        for (const [index, metingView] of metingViews.entries()) {
            const row = document.createElement("tr");
            const measurement = document.createElement("td");
            measurement.className = "rlg-top-column-measurement";
            measurement.style.backgroundColor = metingView.labelParts.find((part) => part.swatchColorHex)?.swatchColorHex || "#d1d5db";
            measurement.appendChild(document.createTextNode(String(index + 1)));
            row.appendChild(measurement);
            const description = document.createElement("td");
            description.className = "rlg-top-column-description";
            description.textContent = metingView.labelParts.find((part) => !this.isToelichtingColumn(part.header))?.text || metingView.metingKey;
            row.appendChild(description);
            if (toelichtingVisible) {
                const toelichting = document.createElement("td");
                toelichting.className = "rlg-top-column-toelichting";
                toelichting.textContent = metingView.labelParts.find((part) => this.isToelichtingColumn(part.header))?.text || "";
                row.appendChild(toelichting);
            }
            for (const [{ index: columnIndex }, detailIndex] of topDetailColumns.map((column, index) => [column, index] as const)) {
                const cell = document.createElement("td");
                cell.className = `rlg-top-column-detail${detailIndex}`;
                cell.textContent = metingView.topDetails.get(columnIndex) || "";
                row.appendChild(cell);
            }
            tbody.appendChild(row);
        }
        table.appendChild(tbody);
        return table;
    }

    private renderReportTable(metingViews: MetingView[], dnTDefinition: RowDefinition | undefined): HTMLElement {
        const card = document.createElement("div");
        card.className = "rlg-report-table-card";

        const title = document.createElement("div");
        title.className = "rlg-report-table-title rlg-window-title";
        this.appendHtmlRichText(title, this.formattingSettings.reportTitleCard.titleText.value);
        card.appendChild(title);

        if (!dnTDefinition) {
            const empty = document.createElement("div");
            empty.className = "rlg-report-table-empty";
            empty.textContent = this.localize("UI_NoDnTData");
            card.appendChild(empty);
            return card;
        }

        const frequencies = this.getFrequenciesInDataOrder(metingViews.flatMap((view) => view.frequencies));
        const reportFrequencyRows = this.buildReportFrequencyRows(frequencies);
        const table = document.createElement("table");
        table.className = "rlg-report-table";
        const thead = document.createElement("thead");
        const measurementRow = document.createElement("tr");
        const frequencyHeader = document.createElement("th");
        frequencyHeader.rowSpan = 4;
        frequencyHeader.className = "rlg-report-frequency-cell";
        this.appendHtmlRichText(frequencyHeader, this.getFrequencyGroupTitle());
        measurementRow.appendChild(frequencyHeader);
        for (const [index, metingView] of metingViews.entries()) {
            const header = document.createElement("th");
            header.className = "rlg-report-measurement-index";
            header.textContent = String(index + 1);
            header.style.background = metingView.labelParts.find((part) => part.swatchColorHex)?.swatchColorHex || "#d1d5db";
            measurementRow.appendChild(header);
        }
        thead.appendChild(measurementRow);

        const metricRow = document.createElement("tr");
        for (const metingView of metingViews) {
            const header = document.createElement("th");
            header.className = "rlg-report-measurement-cell";
            this.appendHtmlRichText(header, this.getFrequencyGroupTitle());
            header.title = metingView.labelParts.map((part) => part.text).join(" / ");
            metricRow.appendChild(header);
        }
        thead.appendChild(metricRow);

        const bandLabel = reportFrequencyRows.some((reportRow) => reportRow.slot !== 1 && reportRow.frequency)
            ? "1/3 oct."
            : "1/1 oct.";
        const bandRow = document.createElement("tr");
        for (const _ of metingViews) {
            const header = document.createElement("th");
            header.className = "rlg-report-measurement-cell";
            header.textContent = bandLabel;
            bandRow.appendChild(header);
        }
        thead.appendChild(bandRow);

        const unitRow = document.createElement("tr");
        for (const _ of metingViews) {
            const header = document.createElement("th");
            header.className = "rlg-report-measurement-cell";
            header.textContent = "[dB]";
            unitRow.appendChild(header);
        }
        thead.appendChild(unitRow);
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        for (const reportRow of reportFrequencyRows) {
            const row = document.createElement("tr");
            row.className = `rlg-report-frequency-row rlg-report-frequency-slot-${reportRow.slot}`;
            const frequencyCell = document.createElement("th");
            frequencyCell.className = "rlg-report-frequency-cell";
            frequencyCell.textContent = reportRow.displayFrequency;
            row.appendChild(frequencyCell);
            for (const metingView of metingViews) {
                const cell = document.createElement("td");
                cell.className = "rlg-report-measurement-cell";
                cell.textContent = reportRow.frequency
                    ? this.formatReportNumber(metingView.matrix.get(this.buildRowFrequencyKey(dnTDefinition.role, reportRow.frequency)) || "")
                    : "";
                row.appendChild(cell);
            }
            tbody.appendChild(row);
        }

        if (this.isSingleValueRoleAvailable("dnTA") && this.visibleSingleValueRoles.has("dnTA")) {
            this.appendReportSummaryRow(tbody, this.getSingleValueRoleLabel("dnTA", "DnT,A"), "dnTA", metingViews);
        }
        if (this.isSingleValueRoleAvailable("dnTAKVerblijfsruimte") && this.visibleSingleValueRoles.has("dnTAKVerblijfsruimte")) {
            this.appendReportSummaryRow(tbody, this.getSingleValueRoleLabel("dnTAKVerblijfsruimte", "DnT,A;k VR"), "dnTAKVerblijfsruimte", metingViews);
        }
        if (this.isSingleValueRoleAvailable("dnTAKVerblijfsgebied") && this.visibleSingleValueRoles.has("dnTAKVerblijfsgebied")) {
            this.appendReportSummaryRow(tbody, this.getSingleValueRoleLabel("dnTAKVerblijfsgebied", "DnT,A;k VG"), "dnTAKVerblijfsgebied", metingViews);
        }
        table.appendChild(tbody);
        card.appendChild(table);
        return card;
    }

    private appendReportSummaryRow(
        tbody: HTMLTableSectionElement,
        label: string,
        role: string,
        metingViews: MetingView[]
    ): void {
        const summaryRow = document.createElement("tr");
        summaryRow.className = `rlg-report-table-summary rlg-report-summary-${role}`;
        const summaryLabel = document.createElement("th");
        this.appendHtmlRichText(summaryLabel, label);
        summaryRow.appendChild(summaryLabel);
        for (const metingView of metingViews) {
            const cell = document.createElement("td");
            cell.className = "rlg-report-measurement-cell";
            cell.textContent = this.formatReportNumber(metingView.singleValues.get(role) || "");
            summaryRow.appendChild(cell);
        }
        tbody.appendChild(summaryRow);
    }

    private buildReportFrequencyRows(frequencies: string[]): ReportFrequencyRow[] {
        const groups = new Map<number, Array<string | null>>();
        const groupOrder: number[] = [];
        for (const frequency of frequencies) {
            const hz = this.parseFrequency(frequency);
            if (!Number.isFinite(hz) || hz <= 0) {
                continue;
            }
            const octaveIndex = Math.round(Math.log2(hz / 63));
            const center = 63 * Math.pow(2, octaveIndex);
            const slot = Math.max(0, Math.min(2, Math.round(Math.log2(hz / center) * 6) + 1));
            if (!groups.has(octaveIndex)) {
                groups.set(octaveIndex, [null, null, null]);
                groupOrder.push(octaveIndex);
            }
            const group = groups.get(octaveIndex) as Array<string | null>;
            group[slot] = frequency;
        }
        return groupOrder.flatMap((groupKey) => {
            const group = groups.get(groupKey) as Array<string | null>;
            return group.map((frequency, slot) => ({
                groupKey,
                slot,
                frequency,
                displayFrequency: frequency || ""
            }));
        });
    }

    private getInfoColumnCount(): number {
        return 1;
    }

    private isToelichtingColumn(header: string): boolean {
        return header.toLowerCase().replace(/[^a-z]/g, "").includes("toelichting");
    }

    private isSingleValueRoleAvailable(role: string): boolean {        return Boolean(this.lastUpdateOptions?.dataViews?.[0]?.table?.columns.some((column) => column.roles?.[role]));
    }

    private renderGraphSettingsSpace(): HTMLElement {
        const graphSpace = document.createElement("div");
        graphSpace.className = "rlg-graph-pane rlg-graph-settings-space";
        return graphSpace;
    }

    private renderGraphSettingsPanel(): HTMLElement {
        const panel = document.createElement("aside");
        panel.className = `rlg-graph-settings-panel ${this.graphSettingsOpen ? "rlg-graph-settings-panel-open" : ""}`;

        const header = document.createElement("div");
        header.className = "rlg-graph-settings-header rlg-window-title";
        this.appendHtmlRichText(header, this.formattingSettings.extraDataTitleCard.settingsTitle.value);
        header.appendChild(this.renderVersionBadge());

        const toggleButton = document.createElement("button");
        toggleButton.type = "button";
        toggleButton.className = `rlg-graph-settings-toggle ${this.graphSettingsOpen ? "rlg-graph-settings-toggle-open" : ""}`;
        toggleButton.title = this.localize(this.graphSettingsOpen ? "UI_HideSettings" : "UI_ShowSettings");
        toggleButton.setAttribute("aria-label", toggleButton.title);
        toggleButton.addEventListener("click", () => {
            this.graphSettingsOpen = !this.graphSettingsOpen;
            this.setInstanceVisibility("graphSettingsOpen", this.graphSettingsOpen);
            panel.classList.toggle("rlg-graph-settings-panel-open", this.graphSettingsOpen);
            toggleButton.classList.toggle("rlg-graph-settings-toggle-open", this.graphSettingsOpen);
            toggleButton.title = this.localize(this.graphSettingsOpen ? "UI_HideSettings" : "UI_ShowSettings");
            toggleButton.setAttribute("aria-label", toggleButton.title);
            if (this.graphSettingsOpen) {
                panel.querySelector(".rlg-graph-settings-collapsed-title")?.remove();
                this.appendGraphSettingsContent(panel, toggleButton);
            } else {
                panel.querySelector(".rlg-graph-settings-header")?.remove();
                panel.querySelector(".rlg-graph-settings-body")?.remove();
                panel.insertBefore(this.renderCollapsedSettingsTitle(), toggleButton);
            }
        });

        if (!this.graphSettingsOpen) {
            panel.appendChild(this.renderCollapsedSettingsTitle());
        }
        panel.appendChild(toggleButton);

        if (this.graphSettingsOpen) {
            this.appendGraphSettingsContent(panel, toggleButton, header);
        }

        return panel;
    }

    private renderCollapsedSettingsTitle(): HTMLElement {
        const title = document.createElement("div");
        title.className = "rlg-graph-settings-collapsed-title";
        this.appendHtmlRichText(title, `${this.formattingSettings.extraDataTitleCard.settingsTitle.value} / ${this.formattingSettings.extraDataTitleCard.measurementDetailsTitle.value}`);
        return title;
    }

    private appendGraphSettingsContent(
        panel: HTMLElement,
        toggleButton: HTMLButtonElement,
        header?: HTMLElement
    ): void {
        if (panel.querySelector(".rlg-graph-settings-body")) {
            return;
        }

        const settingsHeader = header ?? document.createElement("div");
        settingsHeader.className = "rlg-graph-settings-header rlg-window-title";
        settingsHeader.replaceChildren();
        this.appendHtmlRichText(settingsHeader, this.formattingSettings.extraDataTitleCard.settingsTitle.value);
        settingsHeader.appendChild(this.renderVersionBadge());
        panel.insertBefore(settingsHeader, toggleButton);

        const body = document.createElement("div");
        body.className = "rlg-graph-settings-body";

        const controls = document.createElement("div");
        controls.className = "rlg-graph-settings-controls";
        controls.appendChild(this.renderSettingCheckbox(this.localize("UI_ReportView"), this.reportViewActive, (checked) => {
            if (checked) this.setViewMode("report");
        }));
        controls.appendChild(this.renderSettingCheckbox(this.localize("UI_AnalysisView"), this.analysisViewActive, (checked) => {
            if (checked) this.setViewMode("analysis");
        }));
        controls.appendChild(this.renderSettingSelect(
            this.localize("UI_FrequencyRange"),
            [
                { value: "available", label: this.localize("UI_AvailableFrequencies") },
                { value: "extended", label: this.localize("UI_OneExtraFrequency") },
                { value: "custom", label: this.localize("UI_CustomRange") }
            ],
            this.graphFrequencyMode,
            (value) => {
                this.graphFrequencyMode = value as GraphFrequencyMode;
                this.persistVisualState({ graphFrequencyMode: this.graphFrequencyMode });
            }
        ));
        if (this.graphFrequencyMode === "custom") {
            const frequencyOptions = GRAPH_FREQUENCIES.map((frequency) => ({ value: String(frequency), label: `${this.formatFrequency(frequency)} Hz` }));
            controls.appendChild(this.renderSettingSelect(this.localize("UI_StartFrequency"), frequencyOptions, String(this.graphFrequencyStart), (value) => {
                this.graphFrequencyStart = Number(value);
                if (this.graphFrequencyStart > this.graphFrequencyEnd) this.graphFrequencyEnd = this.graphFrequencyStart;
                this.persistVisualState({ graphFrequencyStart: this.graphFrequencyStart, graphFrequencyEnd: this.graphFrequencyEnd });
            }));
            controls.appendChild(this.renderSettingSelect(this.localize("UI_EndFrequency"), frequencyOptions, String(this.graphFrequencyEnd), (value) => {
                this.graphFrequencyEnd = Number(value);
                if (this.graphFrequencyEnd < this.graphFrequencyStart) this.graphFrequencyStart = this.graphFrequencyEnd;
                this.persistVisualState({ graphFrequencyStart: this.graphFrequencyStart, graphFrequencyEnd: this.graphFrequencyEnd });
            }));
        }
        body.appendChild(controls);

        const settingsDivider = this.renderGraphSettingsDivider(body, controls);
        body.appendChild(settingsDivider);

        const details = document.createElement("div");
        details.className = "rlg-measurement-details-section";
        details.style.flex = `0 0 ${(1 - this.graphSettingsSplitRatio) * 100}%`;

        const detailsTitle = document.createElement("div");
        detailsTitle.className = "rlg-graph-settings-header rlg-window-title";
        this.appendHtmlRichText(detailsTitle, this.formattingSettings.extraDataTitleCard.measurementDetailsTitle.value);
        details.appendChild(detailsTitle);

        const detailsContent = document.createElement("div");
        detailsContent.className = "rlg-measurement-details-content";
        detailsContent.appendChild(this.renderMeasurementDetailsTable());
        details.appendChild(detailsContent);
        body.appendChild(details);
        panel.appendChild(body);
    }

    private renderGraphSettingsDivider(body: HTMLElement, controls: HTMLElement): HTMLElement {
        const divider = document.createElement("div");
        divider.className = "rlg-graph-settings-divider";
        divider.title = this.localize("UI_DragSettings");
        divider.tabIndex = 0;
        divider.setAttribute("role", "separator");
        divider.setAttribute("aria-orientation", "horizontal");
        divider.addEventListener("keydown", (event: KeyboardEvent) => {
            if (event.key !== "ArrowUp" && event.key !== "ArrowDown") {
                return;
            }
            event.preventDefault();
            const direction = event.key === "ArrowDown" ? 1 : -1;
            const bodyHeight = Math.max(121, body.clientHeight - divider.offsetHeight);
            const currentHeight = controls.getBoundingClientRect().height;
            const nextHeight = Math.max(40, Math.min(bodyHeight - 80, currentHeight + direction * (event.shiftKey ? 40 : 10)));
            this.graphSettingsSplitRatio = nextHeight / bodyHeight;
            controls.style.flex = `0 0 ${nextHeight}px`;
            const details = body.querySelector<HTMLElement>(".rlg-measurement-details-section");
            if (details) {
                details.style.flex = `0 0 ${bodyHeight - nextHeight}px`;
            }
        });
        controls.style.flex = `0 0 ${this.graphSettingsSplitRatio * 100}%`;
        divider.addEventListener("mousedown", (event: MouseEvent) => {
            event.preventDefault();
            divider.classList.add("rlg-pane-divider-active");
            const onMouseMove = (moveEvent: MouseEvent): void => {
                const bodyRect = body.getBoundingClientRect();
                const availableHeight = Math.max(1, bodyRect.height - divider.getBoundingClientRect().height);
                const settingsHeight = Math.max(
                    40,
                    Math.min(availableHeight - 80, moveEvent.clientY - bodyRect.top)
                );
                this.graphSettingsSplitRatio = settingsHeight / availableHeight;
                controls.style.flex = `0 0 ${settingsHeight}px`;
                const details = body.querySelector<HTMLElement>(".rlg-measurement-details-section");
                if (details) {
                    details.style.flex = `0 0 ${availableHeight - settingsHeight}px`;
                }
            };
            const onMouseUp = (): void => {
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
                divider.classList.remove("rlg-pane-divider-active");
            };
            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        });
        return divider;
    }

    private refreshMeasurementDetailsTable(workspace: HTMLElement): void {
        const content = workspace.querySelector<HTMLElement>(".rlg-measurement-details-content");
        if (content) {
            content.replaceChildren(this.renderMeasurementDetailsTable());
        }
    }

    private renderMeasurementDetailsTable(): HTMLElement {
        const container = document.createElement("div");
        container.className = "rlg-measurement-details-table-wrap";

        if (this.measurementDetailColumns.length === 0) {
            const empty = document.createElement("div");
            empty.className = "rlg-measurement-details-empty";
            empty.textContent = this.localize("UI_EmptyDetails");
            container.appendChild(empty);
            return container;
        }

        const table = document.createElement("table");
        table.className = "rlg-measurement-details-table";
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");

        const descriptionHeader = document.createElement("th");
        this.appendHtmlRichText(descriptionHeader, this.localize("Format_Description"));
        this.applyExtraDataColumnStyle(descriptionHeader, this.formattingSettings.extraDataHeadersCard.getStyle("description"));
        headerRow.appendChild(descriptionHeader);
        for (const [index, column] of this.measurementDetailColumns.entries()) {
            const th = document.createElement("th");
            this.appendHtmlRichText(th, column.label);
            this.applyExtraDataColumnStyle(th, this.formattingSettings.extraDataHeadersCard.getStyle(`detail${index}`));
            headerRow.appendChild(th);
        }
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        for (const row of this.measurementDetailRows) {
            const tr = document.createElement("tr");
            const description = document.createElement("td");
            const descriptionStyle = this.formattingSettings.extraDataValuesCard.getStyle("description");
            description.textContent = this.formatExtraDataValue(row.description, descriptionStyle);
            this.applyExtraDataColumnStyle(description, descriptionStyle);
            tr.appendChild(description);
            for (const [index, column] of this.measurementDetailColumns.entries()) {
                const td = document.createElement("td");
                const valueStyle = this.formattingSettings.extraDataValuesCard.getStyle(`detail${index}`);
                td.textContent = this.formatExtraDataValue(row.values.get(column.colIndex) || "", valueStyle);
                this.applyExtraDataColumnStyle(td, valueStyle);
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
        table.appendChild(tbody);
        container.appendChild(table);
        return container;
    }

    private applyExtraDataColumnStyle(
        element: HTMLElement,
        settings: ReportTextStyleSettings
    ): void {
        element.style.fontFamily = settings.fontFamily.value;
        element.style.fontSize = `${settings.fontSize.value}px`;
        element.style.fontWeight = settings.bold.value ? "700" : "400";
        element.style.fontStyle = settings.italic.value ? "italic" : "normal";
        element.style.textDecoration = settings.underline.value ? "underline" : "none";
        element.style.textAlign = settings.alignment.value;
        element.style.color = settings.color.value.value;
        element.style.backgroundColor = settings.backgroundColor.value.value;
    }

    private formatExtraDataValue(value: string, settings: ReportTextStyleSettings): string {
        const normalized = value.trim().replace(/\s/g, "");
        if (!settings.decimals || !/^[-+]?\d+(?:[.,]\d+)?$/.test(normalized)) {
            return value;
        }
        const numeric = Number(normalized.replace(",", "."));
        if (!Number.isFinite(numeric)) {
            return value;
        }
        const decimals = Math.max(0, Math.min(6, Math.round(settings.decimals.value)));
        return numeric.toLocaleString(this.locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    }

    private getTableVisibilityLabel(): string {
        const title = this.formattingSettings.tableTitleStyleCard.titleText.value
            .replace(/<\/?(?:sub|sup)>/gi, "")
            .trim();
        return this.localize("UI_ShowTable").replace("{0}", title);
    }

    private getPersistedVisibility(dataView: DataView | undefined): {
        showDnTOverview?: boolean; showReportTable?: boolean; showTopPanel?: boolean; reportViewActive?: boolean;
        analysisViewActive?: boolean; showGraphPlaceholder?: boolean; showGraphSettingsPanel?: boolean;
        graphSettingsOpen?: boolean; debugTableVisible?: boolean; graphFrequencyMode?: GraphFrequencyMode;
        graphFrequencyStart?: number; graphFrequencyEnd?: number;
    } {
        const objects = dataView?.metadata?.objects as Record<string, Record<string, unknown>> | undefined;
        const state = objects?.visualState;
        if (!state) {
            return {};
        }
        return {
            showDnTOverview: typeof state.showDnTOverview === "boolean" ? state.showDnTOverview : undefined,
            showReportTable: typeof state.showReportTable === "boolean" ? state.showReportTable : undefined,
            showTopPanel: typeof state.showTopPanel === "boolean" ? state.showTopPanel : undefined,
            reportViewActive: typeof state.reportViewActive === "boolean" ? state.reportViewActive : undefined,
            analysisViewActive: typeof state.analysisViewActive === "boolean" ? state.analysisViewActive : undefined,
            showGraphPlaceholder: typeof state.showGraphPlaceholder === "boolean" ? state.showGraphPlaceholder : undefined,
            showGraphSettingsPanel: typeof state.showGraphSettingsPanel === "boolean" ? state.showGraphSettingsPanel : undefined,
            graphSettingsOpen: typeof state.graphSettingsOpen === "boolean" ? state.graphSettingsOpen : undefined,
            debugTableVisible: typeof state.debugTableVisible === "boolean" ? state.debugTableVisible : undefined,
            graphFrequencyMode: state.graphFrequencyMode === "available" || state.graphFrequencyMode === "extended" || state.graphFrequencyMode === "custom" ? state.graphFrequencyMode : undefined,
            graphFrequencyStart: typeof state.graphFrequencyStart === "number" ? state.graphFrequencyStart : undefined,
            graphFrequencyEnd: typeof state.graphFrequencyEnd === "number" ? state.graphFrequencyEnd : undefined
        };
    }

    private persistVisualState(properties: Record<string, string | number | boolean>): void {
        this.host.persistProperties({ merge: [{ objectName: "visualState", selector: null, properties }] });
        this.requestRerender();
    }

    private getVisibleSingleValueRoles(table: DataViewTable, columnIndex: number): Set<string> {
        if (columnIndex < 0) {
            return new Set();
        }
        const configuredNames = new Map<string, string>([
            ["dnTA", this.normalizeVisibilityLabel(this.getConfiguredColumnName("dnTA", "DnT,A"))],
            ["dnTAKVerblijfsruimte", this.normalizeVisibilityLabel(this.getConfiguredColumnName("dnTAKRoom", "DnT,A;k VR"))],
            ["dnTAKVerblijfsgebied", this.normalizeVisibilityLabel(this.getConfiguredColumnName("dnTAKArea", "DnT,A;k VG"))]
        ]);
        const selected = new Set<string>();
        for (const row of table.rows) {
            const value = this.normalizeVisibilityLabel(String(row[columnIndex] ?? ""));
            if (
                value === configuredNames.get("dnTAKVerblijfsgebied") ||
                value.includes("dntakverblijfsgebied") ||
                value.includes("lntakverblijfsgebied") ||
                value.includes("dntakvg") ||
                value.includes("lntakvg") ||
                value.endsWith("vg")
            ) {
                selected.add("dnTAKVerblijfsgebied");
            } else if (
                value === configuredNames.get("dnTAKVerblijfsruimte") ||
                value.includes("dntakverblijfsruimte") ||
                value.includes("lntakverblijfsruimte") ||
                value.includes("dntakvr") ||
                value.includes("lntakvr") ||
                value.endsWith("vr")
            ) {
                selected.add("dnTAKVerblijfsruimte");
            } else if (value === configuredNames.get("dnTA") || value.includes("dnta") || value.includes("lnta")) {
                selected.add("dnTA");
            } else if (value.includes("toelichting")) {
                selected.add("info");
            }
        }
        return selected;
    }

    private normalizeVisibilityLabel(value: string): string {
        return value
            .replace(/<\/?(?:sub|sup)>/gi, "")
            .toLowerCase()
            .replace(/[^a-z]/g, "");
    }

    private setInstanceVisibility(
        key: "showDnTOverview" | "showReportTable" | "showTopPanel" | "showGraphPlaceholder" | "showGraphSettingsPanel" | "graphSettingsOpen" | "debugTableVisible",
        visible: boolean
    ): void {
        this[key] = visible;
        this.host.persistProperties({
            merge: [{
                objectName: "visualState",
                selector: null,
                properties: { [key]: visible }
            }]
        });
    }

    private setViewMode(mode: "report" | "analysis"): void {
        const isReport = mode === "report";
        const modeState = { reportViewActive: isReport, analysisViewActive: !isReport };
        // Only apply default visibility settings if switching for the first time
        // (i.e., when the previous mode was not set)
        let persistState: Record<string, string | number | boolean> = modeState;
        if (isReport && this.analysisViewActive) {
            // Switching FROM analysis TO report: apply report defaults
            persistState = { ...modeState, showTopPanel: true, showReportTable: true, showGraphPlaceholder: true, showDnTOverview: false };
        } else if (!isReport && this.reportViewActive) {
            // Switching FROM report TO analysis: apply analysis defaults
            persistState = { ...modeState, showTopPanel: false, showReportTable: false, showGraphPlaceholder: true, showDnTOverview: true };
        }
        this.reportViewActive = persistState.reportViewActive as boolean;
        this.analysisViewActive = persistState.analysisViewActive as boolean;
        this.showTopPanel = (persistState.showTopPanel as boolean) ?? this.showTopPanel;
        this.showReportTable = (persistState.showReportTable as boolean) ?? this.showReportTable;
        this.showGraphPlaceholder = (persistState.showGraphPlaceholder as boolean) ?? this.showGraphPlaceholder;
        this.showDnTOverview = (persistState.showDnTOverview as boolean) ?? this.showDnTOverview;
        this.host.persistProperties({ merge: [{ objectName: "visualState", selector: null, properties: persistState }] });
        this.requestRerender();
    }

    private renderGraph(metingViews: MetingView[], dnTDefinition: RowDefinition | undefined): HTMLElement {
        const panel = document.createElement("div");
        const graphPadding = this.formattingSettings.graphPaddingCard;
        panel.className = "rlg-graph-card";
        panel.style.setProperty("--rlg-graph-padding-top", `${graphPadding.topPadding.value}px`);
        panel.style.setProperty("--rlg-graph-padding-right", `${graphPadding.rightPadding.value}px`);
        panel.style.setProperty("--rlg-graph-padding-bottom", `${graphPadding.bottomPadding.value}px`);
        panel.style.setProperty("--rlg-graph-padding-left", `${graphPadding.leftPadding.value}px`);
        if (!dnTDefinition) {
            panel.textContent = this.localize("UI_ConnectDnTForGraph");
            return panel;
        }

        const sourceSeries = this.buildGraphSeries(metingViews, dnTDefinition);
        if (sourceSeries.length === 0) {
            panel.textContent = this.localize("UI_NoValidDnT");
            return panel;
        }

        const octaves = [16, 31.5, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
        const availableFrequencies = Array.from(new Set(sourceSeries.flatMap((item) => item.points.map((point) => point.hz)))).sort((a, b) => a - b);
        const xDomain = this.getGraphFrequencyDomain(availableFrequencies);
        const rangeStart = xDomain[0];
        const rangeEnd = xDomain[xDomain.length - 1];
        const series = sourceSeries
            .map((item) => ({ ...item, points: item.points.filter((point) => point.hz >= rangeStart && point.hz <= rangeEnd) }))
            .filter((item) => item.points.length > 0);
        if (series.length === 0) {
            panel.textContent = this.localize("UI_NoDnTInRange");
            return panel;
        }
        const values = series.flatMap((item) => item.points.map((point) => point.value));
        const isThird = xDomain.some((hz) => !octaves.includes(hz));
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        const yStart = minValue >= 20 && maxValue <= 80 ? 20 : Math.floor(minValue / 10) * 10;
        const yEnd = minValue >= 20 && maxValue <= 80 ? 80 : Math.max(yStart + 60, Math.ceil(maxValue / 10) * 10);
        const availableGraphHeight = this.getGraphDrawingHeight(metingViews.length);
        const xAxis = this.formattingSettings.graphXAxisCard;
        const yAxis = this.formattingSettings.graphYAxisCard;
        const padding = this.formattingSettings.graphPaddingCard;
        const showGraphGuides = padding.showGuides.value;
        const xLabelFontSize = Math.max(1, xAxis.labelFontSize.value);
        const xTitleFontSize = Math.max(1, xAxis.titleFontSize.value);
        const yLabelFontSize = Math.max(1, yAxis.labelFontSize.value);
        const yIntervalCount = Math.max(1, (yEnd - yStart) / 10);
        const yTitleFontSize = Math.max(1, yAxis.titleFontSize.value);
        const titleMargin = Math.max(0, padding.titleGap.value);
        const yLabelValues = Array.from({ length: yIntervalCount + 1 }, (_, index) => yStart + index * 10);
        const longestYLabelLength = Math.max(...yLabelValues.map((value) => String(value).length), 1);
        const measuredYLabelWidth = Math.ceil(longestYLabelLength * yLabelFontSize * 0.65 + 2);
        const margin = {
            left: Math.ceil(yTitleFontSize + measuredYLabelWidth + titleMargin),
            right: 0,
            top: 0,
            bottom: Math.ceil(xLabelFontSize + titleMargin + xTitleFontSize)
        };
        const availablePlotHeight = Math.max(1, availableGraphHeight - margin.top - margin.bottom);
        const naturalYStep = availablePlotHeight / yIntervalCount;
        const xStepRatio = isThird ? 0.25 : 0.75;
        const naturalPlotWidth = Math.max(1, (xDomain.length - 1) * naturalYStep * xStepRatio);
        const plotScale = 1;
        const plotHeight = availablePlotHeight * plotScale;
        const yStep = plotHeight / yIntervalCount;
        const xStep = yStep * xStepRatio;
        const plotWidth = Math.max(1, (xDomain.length - 1) * xStep);
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("class", "rlg-graph");
        svg.setAttribute("width", String(plotWidth + margin.left + margin.right));
        svg.setAttribute("height", String(plotHeight + margin.top + margin.bottom));
        svg.setAttribute("viewBox", `0 0 ${plotWidth + margin.left + margin.right} ${plotHeight + margin.top + margin.bottom}`);
        const x = (hz: number): number => margin.left + Math.max(0, xDomain.indexOf(hz)) * xStep;
        const y = (value: number): number => margin.top + plotHeight - ((value - yStart) / (yEnd - yStart)) * plotHeight;

        for (let value = yStart; value <= yEnd; value += 10) {
            const lineWidth = Math.max(0, yAxis.lineWidth.value);
            this.appendSvg(svg, "line", { x1: margin.left, x2: margin.left + plotWidth, y1: y(value), y2: y(value), stroke: yAxis.gridColor.value.value, "stroke-width": lineWidth, "stroke-dasharray": this.getLineDashArray(String(yAxis.lineStyle.value.value), lineWidth) });
            const label = this.appendSvg(svg, "text", { x: margin.left - 7, y: y(value) + yLabelFontSize * 0.35, "text-anchor": "end", fill: yAxis.labelColor.value.value, "font-family": yAxis.labelFontFamily.value, "font-size": yAxis.labelFontSize.value, "font-weight": yAxis.labelBold.value ? "700" : "400", "font-style": yAxis.labelItalic.value ? "italic" : "normal", "text-decoration": yAxis.labelUnderline.value ? "underline" : "none" }, String(value));
            label.classList.add("rlg-y-axis-label");
        }
        for (const hz of xDomain) {
            const major = octaves.includes(hz);
            const lineColor = major ? xAxis.gridColor.value.value : xAxis.thirdGridColor.value.value;
            const lineWidth = Math.max(0, major ? xAxis.lineWidth.value : xAxis.thirdLineWidth.value);
            const lineStyle = String((major ? xAxis.lineStyle : xAxis.thirdLineStyle).value.value);
            const lineAttributes = { stroke: lineColor, "stroke-width": lineWidth, "stroke-dasharray": this.getLineDashArray(lineStyle, lineWidth) };
            this.appendSvg(svg, "line", { x1: x(hz), x2: x(hz), y1: margin.top, y2: margin.top + plotHeight, ...lineAttributes });
            this.appendSvg(svg, "line", { x1: x(hz), x2: x(hz), y1: margin.top + plotHeight, y2: margin.top + plotHeight + (major ? 6 : 3), ...lineAttributes });
            if (major) {
                const label = this.appendSvg(svg, "text", { x: x(hz), y: margin.top + plotHeight + xLabelFontSize, "text-anchor": "middle", fill: xAxis.labelColor.value.value, "font-family": xAxis.labelFontFamily.value, "font-size": xAxis.labelFontSize.value, "font-weight": xAxis.labelBold.value ? "700" : "400", "font-style": xAxis.labelItalic.value ? "italic" : "normal", "text-decoration": xAxis.labelUnderline.value ? "underline" : "none" }, this.formatFrequency(hz));
                label.classList.add("rlg-x-axis-label");
            }
        }
        this.appendSvg(svg, "line", { x1: margin.left, x2: margin.left + plotWidth, y1: margin.top + plotHeight, y2: margin.top + plotHeight, stroke: xAxis.axisLineColor.value.value, "stroke-width": Math.max(0, xAxis.axisLineWidth.value) });
        this.appendSvg(svg, "line", { x1: margin.left, x2: margin.left, y1: margin.top, y2: margin.top + plotHeight, stroke: yAxis.axisLineColor.value.value, "stroke-width": Math.max(0, yAxis.axisLineWidth.value) });
        const yTitleX = yTitleFontSize / 2;
        if (showGraphGuides) this.appendSvg(svg, "line", {
            x1: yTitleX,
            x2: yTitleX,
            y1: margin.top,
            y2: margin.top + plotHeight,
            stroke: "#16a34a",
            "stroke-width": 1,
            "stroke-dasharray": "3 2",
            "pointer-events": "none"
        });
        const xTitleBaseline = margin.top + plotHeight + xLabelFontSize + titleMargin + xTitleFontSize;
        if (showGraphGuides) this.appendSvg(svg, "line", {
            x1: margin.left,
            x2: margin.left + plotWidth,
            y1: xTitleBaseline,
            y2: xTitleBaseline,
            stroke: "#16a34a",
            "stroke-width": 1,
            "stroke-dasharray": "3 2",
            "pointer-events": "none"
        });
        const xTitle = this.appendSvgRichText(svg, { x: margin.left + plotWidth / 2, y: xTitleBaseline, "text-anchor": "middle", fill: xAxis.titleColor.value.value, "font-family": xAxis.titleFontFamily.value, "font-size": xAxis.titleFontSize.value, "font-weight": xAxis.titleBold.value ? "700" : "400", "font-style": xAxis.titleItalic.value ? "italic" : "normal", "text-decoration": xAxis.titleUnderline.value ? "underline" : "none" }, xAxis.title.value);
        const yTitle = this.appendSvgRichText(svg, { x: yTitleX, y: margin.top + plotHeight / 2, "text-anchor": "middle", fill: yAxis.titleColor.value.value, "font-family": yAxis.titleFontFamily.value, "font-size": yAxis.titleFontSize.value, "font-weight": yAxis.titleBold.value ? "700" : "400", "font-style": yAxis.titleItalic.value ? "italic" : "normal", "text-decoration": yAxis.titleUnderline.value ? "underline" : "none", transform: `rotate(-90 ${yTitleX} ${margin.top + plotHeight / 2})` }, yAxis.title.value);
        yTitle.setAttribute("class", "rlg-graph-axis-title");

        const unselectedStyle = this.formattingSettings.graphUnselectedCard;
        const selectedStyle = this.formattingSettings.graphSelectedCard;
        const highContrastDashPatterns = ["none", "8 3", "2 3", "10 3 2 3", "1 3", "6 2 2 2"];
        for (const [seriesIndex, item] of series.entries()) {
            const selected = this.selectedGraphSeries.has(item.key);
            const hasSelection = this.selectedGraphSeries.size > 0;
            const opacity = hasSelection && !selected ? Math.max(0, Math.min(1, selectedStyle.dimmedOpacity.value)) : 0.7;
            const path = item.points.map((point, index) => `${index === 0 ? "M" : "L"}${x(point.hz)},${y(point.value)}`).join(" ");
            const hit = this.appendSvg(svg, "path", { d: path, fill: "none", stroke: item.color, "stroke-width": 10, "stroke-opacity": 0.01, cursor: "pointer" });
            hit.setAttribute("tabindex", "0");
            hit.setAttribute("role", "button");
            hit.setAttribute("aria-label", `${this.localize("UI_SelectMeasurement")}: ${item.label}`);
            hit.setAttribute("aria-pressed", String(selected));
            this.bindContextMenu(hit, item.selectionId);
            hit.addEventListener("click", (event: MouseEvent) => this.toggleGraphSeries(item.key, item.selectionId, event.ctrlKey));
            this.bindKeyboardActivation(hit as unknown as HTMLElement, (event) => this.toggleGraphSeries(item.key, item.selectionId, event.ctrlKey));
            const line = this.appendSvg(svg, "path", { d: path, fill: "none", stroke: item.color, "stroke-width": selected ? selectedStyle.selectedLineWidth.value : unselectedStyle.lineWidth.value, "stroke-opacity": opacity });
            line.setAttribute("data-series-index", String(seriesIndex));
            if (this.host.colorPalette.isHighContrast) {
                line.setAttribute("stroke-dasharray", highContrastDashPatterns[seriesIndex % highContrastDashPatterns.length]);
            }
            this.bindContextMenu(line, item.selectionId);
            for (const point of item.points) {
                const circle = this.appendSvg(svg, "circle", { cx: x(point.hz), cy: y(point.value), r: Math.sqrt((selected ? selectedStyle.selectedPointSize.value : unselectedStyle.pointSize.value) / Math.PI), fill: item.color, "fill-opacity": opacity, cursor: "pointer" });
                this.bindContextMenu(circle, item.selectionId);
                circle.addEventListener("click", (event: MouseEvent) => this.toggleGraphSeries(item.key, item.selectionId, event.ctrlKey));
                circle.addEventListener("mouseenter", (event: MouseEvent) => {
                    this.host.tooltipService.show({
                        coordinates: [event.clientX, event.clientY],
                        isTouchEvent: false,
                        identities: [item.selectionId],
                        dataItems: [
                            { displayName: this.localize("UI_Measurement"), value: item.label, color: item.color },
                            { displayName: this.localize("UI_Frequency"), value: `${this.formatFrequency(point.hz)} Hz` },
                            { displayName: this.localize("UI_DnT"), value: point.value.toLocaleString(this.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
                        ]
                    });
                });
                circle.addEventListener("mouseleave", () => {
                    this.host.tooltipService.hide({ isTouchEvent: false, immediately: true });
                });
            }
        }
        svg.addEventListener("click", (event: MouseEvent) => {
            if (event.target === svg && this.host.hostCapabilities.allowInteractions !== false) {
                this.selectedGraphSeries.clear();
                this.selectionManager.clear();
                this.requestRerender();
            }
        });
        const wrap = document.createElement("div");
        wrap.className = "rlg-graph-wrap";
        wrap.appendChild(svg);
        panel.appendChild(wrap);
        this.scheduleLayout(() => {
            if (!svg.isConnected) {
                return;
            }
            const xTitleBox = this.getTransformedSvgBounds(xTitle as SVGGraphicsElement, svg);
            const yTitleBox = this.getTransformedSvgBounds(yTitle as SVGGraphicsElement, svg);
            const xLabelBox = this.getSvgElementsBounds(svg.querySelectorAll<SVGGraphicsElement>(".rlg-x-axis-label"));
            const yLabelBox = this.getSvgElementsBounds(svg.querySelectorAll<SVGGraphicsElement>(".rlg-y-axis-label"));
            const titleMargin = Math.max(0, padding.titleGap.value);
            xTitle.setAttribute("transform", `translate(0 ${xLabelBox.bottom + titleMargin - xTitleBox.top})`);
            yTitle.setAttribute("transform", `translate(${yLabelBox.left - titleMargin - yTitleBox.right} 0) rotate(-90 ${yTitleX} ${margin.top + plotHeight / 2})`);
            const alignedXTitleBox = this.getTransformedSvgBounds(xTitle as SVGGraphicsElement, svg);
            const alignedYTitleBox = this.getTransformedSvgBounds(yTitle as SVGGraphicsElement, svg);
            if (showGraphGuides) {
                this.appendSvg(svg, "rect", { x: xLabelBox.x, y: xLabelBox.y, width: xLabelBox.width, height: xLabelBox.height, fill: "none", stroke: "#ef4444", "stroke-width": 1, "stroke-dasharray": "4 3", "pointer-events": "none" });
                this.appendSvg(svg, "rect", { x: yLabelBox.x, y: yLabelBox.y, width: yLabelBox.width, height: yLabelBox.height, fill: "none", stroke: "#ef4444", "stroke-width": 1, "stroke-dasharray": "4 3", "pointer-events": "none" });
                this.appendSvg(svg, "rect", { x: alignedXTitleBox.x, y: alignedXTitleBox.y, width: alignedXTitleBox.width, height: alignedXTitleBox.height, fill: "none", stroke: "#f97316", "stroke-width": 1, "stroke-dasharray": "4 3", "pointer-events": "none" });
                this.appendSvg(svg, "rect", { x: alignedYTitleBox.x, y: alignedYTitleBox.y, width: alignedYTitleBox.width, height: alignedYTitleBox.height, fill: "none", stroke: "#f97316", "stroke-width": 1, "stroke-dasharray": "4 3", "pointer-events": "none" });
            }
            this.fitSvgToTitleBounds(svg, alignedXTitleBox, alignedYTitleBox, xLabelBox, yLabelBox);
            this.scheduleLayout(() => this.fitGraphHeightToAvailableWidth(panel, 0));
        });
        return panel;
    }

    private fitGraphHeightToAvailableWidth(panel: HTMLElement, attempt: number): void {
        if (!panel.isConnected) {
            return;
        }
        const graphPane = panel.closest<HTMLElement>(".rlg-graph-pane");
        const graphRow = panel.closest<HTMLElement>(".rlg-graph-content-row");
        const workspace = panel.closest<HTMLElement>(".rlg-workspace");
        if (!graphPane || !graphRow) {
            return;
        }

        const reportPanel = graphRow.querySelector<HTMLElement>(".rlg-graph-left-panel");
        const reportStyle = reportPanel ? getComputedStyle(reportPanel) : undefined;
        const reportWidth = reportPanel
            ? reportPanel.getBoundingClientRect().width
                + parseFloat(reportStyle?.marginLeft || "0")
                + parseFloat(reportStyle?.marginRight || "0")
            : 0;
        const settingsPanel = workspace?.querySelector<HTMLElement>(".rlg-graph-settings-panel");
        const settingsWidth = settingsPanel && !settingsPanel.hidden
            ? settingsPanel.getBoundingClientRect().width
            : 0;
        const availableWidth = Math.max(1, graphPane.clientWidth - reportWidth - settingsWidth);
        const bounds = panel.getBoundingClientRect();
        if (bounds.width <= availableWidth + 0.5 || bounds.height <= 0) {
            return;
        }

        const minimumHeight = 80;
        const targetHeight = Math.max(minimumHeight, Math.floor(bounds.height * availableWidth / bounds.width));
        if (targetHeight >= bounds.height - 0.5) {
            return;
        }
        panel.style.height = `${targetHeight}px`;
        panel.style.alignSelf = "flex-start";
        if (attempt < 1 && targetHeight > minimumHeight) {
            this.scheduleLayout(() => this.fitGraphHeightToAvailableWidth(panel, attempt + 1));
        }
    }

    private fitSvgToTitleBounds(
        svg: SVGSVGElement,
        xTitleBox: DOMRect,
        yTitleBox: DOMRect,
        xLabelBox: DOMRect,
        yLabelBox: DOMRect
    ): void {
        const currentViewBox = svg.viewBox.baseVal;
        const left = Math.min(currentViewBox.x, xTitleBox.x, yTitleBox.x, xLabelBox.x, yLabelBox.x);
        const top = Math.min(currentViewBox.y, xTitleBox.y, yTitleBox.y, xLabelBox.y, yLabelBox.y);
        const right = Math.max(currentViewBox.x + currentViewBox.width, xTitleBox.right, yTitleBox.right, xLabelBox.right, yLabelBox.right);
        const bottom = Math.max(currentViewBox.y + currentViewBox.height, xTitleBox.bottom, yTitleBox.bottom, xLabelBox.bottom, yLabelBox.bottom);
        const width = right - left;
        const height = bottom - top;
        if (left !== currentViewBox.x || top !== currentViewBox.y || width !== currentViewBox.width || height !== currentViewBox.height) {
            svg.setAttribute("viewBox", `${left} ${top} ${width} ${height}`);
            svg.setAttribute("width", String(width));
            svg.setAttribute("height", String(height));
        }
    }

    private getTransformedSvgBounds(element: SVGGraphicsElement, svg: SVGSVGElement): DOMRect {
        const svgMatrix = svg.getScreenCTM();
        const renderedBounds = element.getBoundingClientRect();
        if (!svgMatrix) {
            return new DOMRect(renderedBounds.x, renderedBounds.y, renderedBounds.width, renderedBounds.height);
        }
        const matrix = svgMatrix.inverse();
        const points = [
            new DOMPoint(renderedBounds.left, renderedBounds.top),
            new DOMPoint(renderedBounds.right, renderedBounds.top),
            new DOMPoint(renderedBounds.left, renderedBounds.bottom),
            new DOMPoint(renderedBounds.right, renderedBounds.bottom)
        ].map((point) => point.matrixTransform(matrix));
        const left = Math.min(...points.map((point) => point.x));
        const top = Math.min(...points.map((point) => point.y));
        const right = Math.max(...points.map((point) => point.x));
        const bottom = Math.max(...points.map((point) => point.y));
        return new DOMRect(left, top, right - left, bottom - top);
    }

    private getSvgElementsBounds(elements: NodeListOf<SVGGraphicsElement>): DOMRect {
        const boxes = Array.from(elements).map((element) => element.getBBox());
        if (boxes.length === 0) {
            return new DOMRect(0, 0, 0, 0);
        }
        const left = Math.min(...boxes.map((box) => box.x));
        const top = Math.min(...boxes.map((box) => box.y));
        const right = Math.max(...boxes.map((box) => box.x + box.width));
        const bottom = Math.max(...boxes.map((box) => box.y + box.height));
        return new DOMRect(left, top, right - left, bottom - top);
    }

    private buildGraphSeries(metingViews: MetingView[], dnTDefinition: RowDefinition): GraphSeries[] {
        return metingViews.map((view) => {
            const label = view.labelParts.map((part) => part.text).filter(Boolean).join(" - ") || view.metingKey;
            const color = view.labelParts.map((part) => part.swatchColorHex).find(Boolean) || this.host.colorPalette.getColor(view.metingKey).value;
            const points = view.frequencies.map((frequency) => ({ hz: this.parseFrequency(frequency), value: this.parseMetric(view.matrix.get(this.buildRowFrequencyKey(dnTDefinition.role, frequency)) || "") })).filter((point) => Number.isFinite(point.hz) && Number.isFinite(point.value)).sort((a, b) => a.hz - b.hz);
            return { key: view.metingKey, label, color, selectionId: view.selectionId, points };
        }).filter((item) => item.points.length > 0);
    }

    private getGraphFrequencyDomain(available: number[]): number[] {
        if (available.length === 0 || this.graphFrequencyMode === "available") {
            return available;
        }
        if (this.graphFrequencyMode === "extended") {
            const lower = [...GRAPH_FREQUENCIES].reverse().find((frequency) => frequency < available[0]);
            const upper = GRAPH_FREQUENCIES.find((frequency) => frequency > available[available.length - 1]);
            return Array.from(new Set([
                ...(lower === undefined ? [] : [lower]),
                ...available,
                ...(upper === undefined ? [] : [upper])
            ])).sort((a, b) => a - b);
        }
        const start = Math.min(this.graphFrequencyStart, this.graphFrequencyEnd);
        const end = Math.max(this.graphFrequencyStart, this.graphFrequencyEnd);
        return Array.from(new Set([
            ...GRAPH_FREQUENCIES.filter((frequency) => frequency >= start && frequency <= end),
            ...available.filter((frequency) => frequency >= start && frequency <= end)
        ])).sort((a, b) => a - b);
    }

    private appendSvg(parent: SVGElement, tag: string, attributes: Record<string, string | number>, text?: string): SVGElement {
        const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
        Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
        if (text !== undefined) {
            element.textContent = text;
        }
        parent.appendChild(element);
        return element;
    }

    private getLineDashArray(lineStyle: string, lineWidth: number): string {
        const unit = Math.max(1, lineWidth);
        if (lineStyle === "dashed") {
            return `${6 * unit} ${4 * unit}`;
        }
        if (lineStyle === "dotted") {
            return `${unit} ${3 * unit}`;
        }
        return "none";
    }

    private appendSvgRichText(parent: SVGElement, attributes: Record<string, string | number>, text: string): SVGElement {
        const element = this.appendSvg(parent, "text", attributes);
        for (const part of text.split(/(<sub>.*?<\/sub>|<sup>.*?<\/sup>)/gi)) {
            const subscript = /^<sub>.*<\/sub>$/i.test(part);
            const superscript = /^<sup>.*<\/sup>$/i.test(part);
            const content = subscript || superscript ? part.replace(/^<(sub|sup)>|<\/(sub|sup)>$/gi, "") : part;
            if (content.length === 0) {
                continue;
            }
            const span = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
            span.textContent = content;
            if (subscript || superscript) {
                span.setAttribute("font-size", "70%");
                span.setAttribute("baseline-shift", subscript ? "sub" : "super");
            }
            element.appendChild(span);
        }
        return element;
    }

    private appendHtmlRichText(parent: HTMLElement, text: string): void {
        for (const part of text.split(/(<sub>.*?<\/sub>|<sup>.*?<\/sup>)/gi)) {
            const subscript = /^<sub>.*<\/sub>$/i.test(part);
            const superscript = /^<sup>.*<\/sup>$/i.test(part);
            const content = subscript || superscript ? part.replace(/^<(sub|sup)>|<\/(sub|sup)>$/gi, "") : part;
            if (content.length === 0) {
                continue;
            }
            const element = document.createElement(subscript ? "sub" : superscript ? "sup" : "span");
            element.textContent = content;
            parent.appendChild(element);
        }
    }

    private toggleGraphSeries(key: string, selectionId: ISelectionId, multiSelect: boolean): void {
        if (this.host.hostCapabilities.allowInteractions === false) {
            return;
        }
        if (!multiSelect) {
            this.selectedGraphSeries = this.selectedGraphSeries.has(key) && this.selectedGraphSeries.size === 1 ? new Set<string>() : new Set<string>([key]);
        } else if (this.selectedGraphSeries.has(key)) {
            this.selectedGraphSeries.delete(key);
        } else {
            this.selectedGraphSeries.add(key);
        }
        if (this.selectedGraphSeries.size === 0) {
            this.selectionManager.clear();
        } else {
            this.selectionManager.select(selectionId, multiSelect);
        }
        this.requestRerender();
    }

    private parseFrequency(value: string): number {
        const normalized = value.toLowerCase().replace(/\u200b/g, "").replace(/hz/g, "").trim().replace(",", ".");
        const matched = normalized.match(/^([0-9.]+)\s*k?$/);
        if (!matched) {
            return Number.NaN;
        }
        const parsed = Number(matched[1]);
        return normalized.includes("k") ? parsed * 1000 : parsed;
    }

    private parseMetric(value: string): number {
        const normalized = value.includes(",")
            ? value.replace(/\./g, "").replace(",", ".").replace(/[^0-9.-]/g, "")
            : value.replace(/[^0-9.-]/g, "");
        return normalized.length > 0 ? Number(normalized) : Number.NaN;
    }

    private formatFrequency(hz: number): string {
        if (hz < 1000) {
            return String(hz).replace(".", ",");
        }
        return `${String(hz / 1000).replace(".", ",")}k`;
    }

    private appendResizablePane(target: HTMLElement, key: string, pane: HTMLElement, defaultHeight: number): void {
        if (this.previousResizablePane) {
            target.appendChild(this.renderPaneDivider(this.previousResizablePane, { key, defaultHeight }));
        }
        pane.dataset.paneKey = key;
        target.appendChild(pane);
        this.previousResizablePane = { key, defaultHeight };
    }

    private renderPaneDivider(
        upperPane: { key: string; defaultHeight: number },
        lowerPane: { key: string; defaultHeight: number }
    ): HTMLElement {
        const divider = document.createElement("div");
        divider.className = "rlg-pane-divider";
        divider.title = this.localize("UI_DragPane");
        divider.tabIndex = 0;
        divider.setAttribute("role", "separator");
        divider.setAttribute("aria-orientation", "horizontal");
        divider.addEventListener("keydown", (event: KeyboardEvent) => {
            if (event.key !== "ArrowUp" && event.key !== "ArrowDown") {
                return;
            }
            event.preventDefault();
            const direction = event.key === "ArrowDown" ? 1 : -1;
            this.resizePanesByKeyboard(upperPane, lowerPane, direction * (event.shiftKey ? 40 : 10));
        });
        if (upperPane.key === "graph" && lowerPane.key === "table") {
            divider.addEventListener("dblclick", () => {
                this.fitTablePaneToMeasurements(divider);
            });
        }
        divider.addEventListener("mousedown", (event: MouseEvent) => {
            event.preventDefault();
            divider.classList.add("rlg-pane-divider-active");
            const startY = event.clientY;
            const upperStartHeight = this.getPaneHeight(upperPane.key, upperPane.defaultHeight);
            const lowerStartHeight = this.getPaneHeight(lowerPane.key, lowerPane.defaultHeight);
            let hasMoved = false;

            const onMouseMove = (moveEvent: MouseEvent): void => {
                const delta = moveEvent.clientY - startY;
                if (upperPane.key === "graph") {
                    const graphHeight = this.getRenderedPaneHeight("graph", upperStartHeight);
                    const maximumLowerHeight = lowerStartHeight + Math.max(0, graphHeight - this.getMinimumPaneHeight("graph"));
                    const lowerHeight = Math.max(
                        this.getMinimumPaneHeight(lowerPane.key),
                        Math.min(maximumLowerHeight, lowerStartHeight - delta)
                    );
                    hasMoved = hasMoved || lowerHeight !== lowerStartHeight;
                    this.setResizablePaneHeight(lowerPane.key, lowerHeight);
                    return;
                }
                if (lowerPane.key === "graph") {
                    const graphHeight = this.getRenderedPaneHeight("graph", lowerStartHeight);
                    const maximumUpperHeight = upperStartHeight + Math.max(0, graphHeight - this.getMinimumPaneHeight("graph"));
                    const upperHeight = Math.max(
                        this.getMinimumPaneHeight(upperPane.key),
                        Math.min(maximumUpperHeight, upperStartHeight + delta)
                    );
                    hasMoved = hasMoved || upperHeight !== upperStartHeight;
                    this.setResizablePaneHeight(upperPane.key, upperHeight);
                    return;
                }
                const boundedDelta = Math.max(
                    this.getMinimumPaneHeight(upperPane.key) - upperStartHeight,
                    Math.min(lowerStartHeight - this.getMinimumPaneHeight(lowerPane.key), delta)
                );
                const upperHeight = upperStartHeight + boundedDelta;
                const lowerHeight = lowerStartHeight - boundedDelta;
                hasMoved = hasMoved || boundedDelta !== 0;
                this.setResizablePaneHeight(upperPane.key, upperHeight);
                this.setResizablePaneHeight(lowerPane.key, lowerHeight);
            };
            const onMouseUp = (): void => {
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
                divider.classList.remove("rlg-pane-divider-active");
                if (hasMoved) {
                    this.requestRerender();
                }
            };

            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        });
        return divider;
    }

    private resizePanesByKeyboard(
        upperPane: { key: string; defaultHeight: number },
        lowerPane: { key: string; defaultHeight: number },
        delta: number
    ): void {
        const upperHeight = this.getPaneHeight(upperPane.key, upperPane.defaultHeight);
        const lowerHeight = this.getPaneHeight(lowerPane.key, lowerPane.defaultHeight);
        if (upperPane.key === "graph") {
            const maximumLowerHeight = lowerHeight + Math.max(0, this.getRenderedPaneHeight("graph", upperHeight) - this.getMinimumPaneHeight("graph"));
            this.setResizablePaneHeight(lowerPane.key, Math.max(this.getMinimumPaneHeight(lowerPane.key), Math.min(maximumLowerHeight, lowerHeight - delta)));
            return;
        }
        if (lowerPane.key === "graph") {
            const maximumUpperHeight = upperHeight + Math.max(0, this.getRenderedPaneHeight("graph", lowerHeight) - this.getMinimumPaneHeight("graph"));
            this.setResizablePaneHeight(upperPane.key, Math.max(this.getMinimumPaneHeight(upperPane.key), Math.min(maximumUpperHeight, upperHeight + delta)));
            return;
        }
        const boundedDelta = Math.max(
            this.getMinimumPaneHeight(upperPane.key) - upperHeight,
            Math.min(lowerHeight - this.getMinimumPaneHeight(lowerPane.key), delta)
        );
        this.setResizablePaneHeight(upperPane.key, upperHeight + boundedDelta);
        this.setResizablePaneHeight(lowerPane.key, lowerHeight - boundedDelta);
    }

    private getRenderedPaneHeight(key: string, fallbackHeight: number): number {
        return this.container.querySelector<HTMLElement>(`[data-pane-key="${key}"]`)
            ?.getBoundingClientRect().height || fallbackHeight;
    }

    private setResizablePaneHeight(key: string, height: number): void {
        if (key === "graph") {
            return;
        }
        this.paneHeights.set(key, height);
        this.applyPanePreview(key, height);
    }

    private applyPanePreview(key: string, height: number): void {
        const pane = this.container.querySelector<HTMLElement>(`[data-pane-key="${key}"]`);
        if (!pane) {
            return;
        }

        const wrap = pane.querySelector<HTMLElement>(".rlg-table-wrap");
        if (wrap) {
            wrap.style.height = `${height}px`;
            wrap.style.maxHeight = `${height}px`;
        }
    }

    private fitTablePaneToMeasurements(divider: HTMLElement): void {
        const tablePane = divider.nextElementSibling as HTMLElement | null;
        const wrap = tablePane?.querySelector<HTMLElement>(".rlg-table-wrap");
        const table = wrap?.querySelector<HTMLTableElement>(".rlg-table");
        if (!table) {
            return;
        }

        this.paneHeights.set("table", this.getMeasuredTableHeight(table, "tbody > tr.rlg-summary-row"));
        this.requestRerender();
    }

    private fitInitialTableHeight(): void {
        if (!this.showDnTOverview || this.paneHeights.has("table") || this.initialTableFitPending) {
            return;
        }

        this.initialTableFitPending = true;
        this.scheduleLayout(() => {
            this.initialTableFitPending = false;
            const table = this.container.querySelector<HTMLTableElement>(".rlg-table-card .rlg-table");
            if (!table || this.paneHeights.has("table")) {
                return;
            }
            this.paneHeights.set("table", this.getMeasuredTableHeight(table, "tbody > tr.rlg-summary-row"));
            this.requestRerender();
        });
    }

    private getMeasuredTableHeight(table: HTMLTableElement, rowSelector: string): number {
        const headerHeight = table.tHead?.getBoundingClientRect().height || 0;
        const rowsHeight = Array.from(table.querySelectorAll<HTMLTableRowElement>(rowSelector))
            .reduce((total, row) => total + row.getBoundingClientRect().height, 0);
        return Math.ceil(
            headerHeight
            + rowsHeight
            + this.getHorizontalScrollbarHeight(table)
            + Visual.ExtraTableBottomMargin
        );
    }

    private getHorizontalScrollbarHeight(table: HTMLTableElement): number {
        const wrap = table.closest<HTMLElement>(".rlg-table-wrap");
        if (!wrap || wrap.scrollWidth <= wrap.clientWidth + 1) {
            return 0;
        }
        const style = getComputedStyle(wrap);
        const borderHeight = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
        return Math.max(0, wrap.offsetHeight - wrap.clientHeight - borderHeight);
    }

    private getTableViewportHeight(wrap: HTMLElement): number {
        const style = getComputedStyle(wrap);
        const borderHeight = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
        return wrap.offsetHeight - borderHeight;
    }

    private getPaneHeight(key: string, defaultHeight: number): number {
        return this.paneHeights.get(key) ?? defaultHeight;
    }

    private getAvailableGraphPlotHeight(measurementCount: number): number {
        const tableHeight = this.showDnTOverview
            ? this.getPaneHeight("table", this.getDefaultTableHeight(measurementCount))
            : 0;
        const debugHeight = this.debugTableVisible
            ? this.getPaneHeight("debug", 220) + 68
            : 0;
        const titleHeight = this.formattingSettings.generalStyleCard.titleVisible.value ? 30 : 0;
        const dividerHeight = (this.showDnTOverview ? 10 : 0) + (debugHeight > 0 ? 10 : 0);
        const visualPadding = 52;
        return Math.max(120, this.viewportHeight - visualPadding - titleHeight - tableHeight - debugHeight - dividerHeight - 56);
    }

    private getGraphDrawingHeight(measurementCount: number): number {
        const topPanelHeight = this.showTopPanel ? 96 : 0;
        return Math.max(60, this.getAvailableGraphPlotHeight(measurementCount) - topPanelHeight);
    }

    private getDefaultTableHeight(measurementCount: number): number {
        const rowFontSize = Math.max(1, this.formattingSettings.tableColumnsCard.getStyle("frequency").fontSize.value);
        const headerHeight = Math.ceil(rowFontSize * 1.2 + 10);
        const rowHeight = Math.ceil(rowFontSize * 1.2 + 10);
        return Math.max(120, headerHeight + rowHeight * measurementCount + Visual.ExtraTableBottomMargin);
    }

    private getMinimumPaneHeight(key: string): number {
        return key === "debug" ? 80 : 120;
    }

    private renderSettingCheckbox(
        labelText: string,
        initialValue: boolean,
        onChange: (value: boolean) => void
    ): HTMLElement {
        const label = document.createElement("label");
        label.className = "rlg-settings-item";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = initialValue;
        checkbox.addEventListener("change", () => {
            onChange(checkbox.checked);
            this.requestRerender();
        });

        const text = document.createElement("span");
        text.textContent = labelText;

        label.appendChild(checkbox);
        label.appendChild(text);

        return label;
    }

    private renderSettingSelect(
        labelText: string,
        options: Array<{ value: string; label: string }>,
        selectedValue: string,
        onChange: (value: string) => void
    ): HTMLElement {
        const label = document.createElement("label");
        label.className = "rlg-settings-item rlg-settings-select-item";
        const text = document.createElement("span");
        text.textContent = labelText;
        const select = document.createElement("select");
        for (const option of options) {
            const node = document.createElement("option");
            node.value = option.value;
            node.textContent = option.label;
            select.appendChild(node);
        }
        select.value = selectedValue;
        select.addEventListener("change", () => onChange(select.value));
        label.appendChild(text);
        label.appendChild(select);
        return label;
    }

    private requestRerender(): void {
        if (this.lastUpdateOptions) {
            this.update(this.lastUpdateOptions);
        }
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        this.localizeFormattingLabels();
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }

    private applyStyleSettings(): void {
        const general = this.formattingSettings.generalStyleCard;
        const windowTitleBars = this.formattingSettings.windowTitleBarsCard;
        const tableTitle = this.formattingSettings.tableTitleStyleCard;
        const tableSpacing = this.formattingSettings.tableSpacingCard;
        const tableLines = this.formattingSettings.tableLinesCard;
        const report = this.formattingSettings.reportSpacingCard;
        const reportLines = this.formattingSettings.reportLinesCard;
        const windowLines = this.formattingSettings.windowLinesCard;
        const reportText = this.formattingSettings.reportTextCard;
        const reportSummary = this.formattingSettings.reportSummaryCard;
        const tableSelection = this.formattingSettings.tableSelectionCard;
        const extraDataTitle = this.formattingSettings.extraDataTitleCard;
        const style = this.container.style;

        style.setProperty("--rlg-window-title-line-height", String(Math.max(1, windowTitleBars.lineHeight.value)));
        style.setProperty("--rlg-window-title-padding-y", `${Math.max(0, windowTitleBars.verticalPadding.value)}px`);
        style.setProperty("--rlg-window-title-padding-x", `${Math.max(0, windowTitleBars.horizontalPadding.value)}px`);

        style.setProperty("--rlg-title-font-family", general.titleFontFamily.value);
        style.setProperty("--rlg-title-font-size", `${general.titleFontSize.value}px`);
        style.setProperty("--rlg-title-font-weight", general.titleBold.value ? "600" : "400");
        style.setProperty("--rlg-title-color", general.titleColor.value.value);

        style.setProperty("--rlg-table-title-font-family", tableTitle.fontFamily.value);
        style.setProperty("--rlg-table-title-font-size", `${tableTitle.fontSize.value}px`);
        style.setProperty("--rlg-table-title-font-weight", tableTitle.bold.value ? "600" : "400");
        style.setProperty("--rlg-table-title-font-style", tableTitle.italic.value ? "italic" : "normal");
        style.setProperty("--rlg-table-title-text-decoration", tableTitle.underline.value ? "underline" : "none");
        style.setProperty("--rlg-table-title-color", tableTitle.color.value.value);
        style.setProperty("--rlg-table-title-bg", tableTitle.backgroundColor.value.value);
        style.setProperty("--rlg-header-row-padding", `${Math.max(0, tableSpacing.headerRowPadding.value)}px`);
        style.setProperty("--rlg-measurement-row-padding", `${Math.max(0, tableSpacing.measurementRowPadding.value)}px`);
        style.setProperty("--rlg-detail-row-padding", `${Math.max(0, tableSpacing.detailRowPadding.value)}px`);
        style.setProperty("--rlg-table-horizontal-line", `${Math.max(0, tableLines.horizontalWidth.value)}px solid ${tableLines.horizontalColor.value.value}`);
        style.setProperty("--rlg-table-vertical-line", `${Math.max(0, tableLines.verticalWidth.value)}px solid ${tableLines.verticalColor.value.value}`);
        style.setProperty("--rlg-table-vertical-line-width", `${Math.max(0, tableLines.verticalWidth.value)}px`);
        style.setProperty("--rlg-table-vertical-line-color", tableLines.verticalColor.value.value);
        style.setProperty("--rlg-report-row-height", `${Math.max(1, report.rowHeight.value)}px`);
        style.setProperty("--rlg-report-frequency-width", `${Math.max(1, report.frequencyColumnWidth.value)}px`);
        style.setProperty("--rlg-report-measurement-width", `${Math.max(1, report.measurementColumnWidth.value)}px`);
        style.setProperty("--rlg-report-octave-line-color", reportLines.octaveBandColor.value.value);
        style.setProperty("--rlg-report-octave-line-width", `${Math.max(0, reportLines.octaveBandWidth.value)}px`);
        style.setProperty("--rlg-report-result-line-color", reportLines.resultRowColor.value.value);
        style.setProperty("--rlg-report-result-line-width", `${Math.max(0, reportLines.resultRowWidth.value)}px`);
        style.setProperty("--rlg-report-vertical-line", `${Math.max(0, reportLines.verticalWidth.value)}px solid ${reportLines.verticalColor.value.value}`);
        const reportTitle = this.formattingSettings.reportTitleCard;
        style.setProperty("--rlg-report-title-font-family", reportTitle.fontFamily.value);
        style.setProperty("--rlg-report-title-font-size", `${reportTitle.fontSize.value}px`);
        style.setProperty("--rlg-report-title-font-weight", reportTitle.bold.value ? "600" : "400");
        style.setProperty("--rlg-report-title-font-style", reportTitle.italic.value ? "italic" : "normal");
        style.setProperty("--rlg-report-title-text-decoration", reportTitle.underline.value ? "underline" : "none");
        style.setProperty("--rlg-report-title-color", reportTitle.color.value.value);
        style.setProperty("--rlg-report-title-bg", reportTitle.backgroundColor.value.value);
        this.applyWindowLine(style, "report", windowLines.reportVisible.value, windowLines.reportColor.value.value, windowLines.reportWidth.value);
        this.applyWindowLine(style, "graph", windowLines.graphVisible.value, windowLines.graphColor.value.value, windowLines.graphWidth.value);
        this.applyWindowLine(style, "table", windowLines.tableVisible.value, windowLines.tableColor.value.value, windowLines.tableWidth.value);
        this.applyWindowLine(style, "side", windowLines.sideVisible.value, windowLines.sideColor.value.value, windowLines.sideWidth.value);
        this.applyReportTextStyle(style, "frequency", reportText.frequency);
        this.applyReportTextStyle(style, "measurement", reportText.measurement);
        this.applyReportTextStyle(style, "dnta", reportSummary.dnTA);
        this.applyReportTextStyle(style, "dntak-room", reportSummary.dnTAKRoom);
        this.applyReportTextStyle(style, "dntak-area", reportSummary.dnTAKArea);
        for (const [key, settings] of Object.entries(this.formattingSettings.topWindowColumnsCard.styles)) {
            const prefix = `top-${key}`;
            this.applyReportTextStyle(style, prefix, settings);
            style.setProperty(`--rlg-report-${prefix}-header-bg`, settings.headerBackgroundColor.value.value);
        }
        const topWindowLines = this.formattingSettings.topWindowLinesCard;
        style.setProperty("--rlg-top-window-horizontal-line", `${Math.max(0, topWindowLines.horizontalWidth.value)}px solid ${topWindowLines.horizontalColor.value.value}`);
        style.setProperty("--rlg-top-window-vertical-line", `${Math.max(0, topWindowLines.verticalWidth.value)}px solid ${topWindowLines.verticalColor.value.value}`);
        const applyColumnStyle = (
            prefix: string,
            card: ReturnType<typeof this.formattingSettings.tableColumnsCard.getStyle>
        ): void => {
            style.setProperty(`--rlg-${prefix}-font-family`, card.fontFamily.value);
            style.setProperty(`--rlg-${prefix}-font-size`, `${card.fontSize.value}px`);
            style.setProperty(`--rlg-${prefix}-font-weight`, card.bold.value ? "700" : "400");
            style.setProperty(`--rlg-${prefix}-font-style`, card.italic.value ? "italic" : "normal");
            style.setProperty(`--rlg-${prefix}-text-decoration`, card.underline.value ? "underline" : "none");
            style.setProperty(`--rlg-${prefix}-text-align`, card.alignment.value);
            style.setProperty(`--rlg-${prefix}-color`, card.color.value.value);
            style.setProperty(`--rlg-${prefix}-bg`, card.backgroundColor.value.value);
        };
        for (let index = 0; index < 10; index += 1) {
            applyColumnStyle(`label${index}`, this.formattingSettings.tableColumnsCard.getStyle(`label${index}`));
        }
        applyColumnStyle("info", this.formattingSettings.tableColumnsCard.getStyle("info"));
        applyColumnStyle("dnta", this.formattingSettings.tableColumnsCard.getStyle("dnTA"));
        applyColumnStyle("dntak-room", this.formattingSettings.tableColumnsCard.getStyle("dnTAKRoom"));
        applyColumnStyle("dntak-area", this.formattingSettings.tableColumnsCard.getStyle("dnTAKArea"));
        applyColumnStyle("frequency", this.formattingSettings.tableColumnsCard.getStyle("frequency"));
        style.setProperty(
            "--rlg-selected-row-bg",
            this.colorWithTransparency(tableSelection.backgroundColor.value.value, tableSelection.transparency.value)
        );
        style.setProperty("--rlg-selected-row-color", tableSelection.fontColor.value.value);
        style.setProperty("--rlg-extra-data-title-font-family", extraDataTitle.fontFamily.value);
        style.setProperty("--rlg-extra-data-title-font-size", `${extraDataTitle.fontSize.value}px`);
        style.setProperty("--rlg-extra-data-title-font-weight", extraDataTitle.bold.value ? "700" : "400");
        style.setProperty("--rlg-extra-data-title-font-style", extraDataTitle.italic.value ? "italic" : "normal");
        style.setProperty("--rlg-extra-data-title-text-decoration", extraDataTitle.underline.value ? "underline" : "none");
        style.setProperty("--rlg-extra-data-title-color", extraDataTitle.color.value.value);
        style.setProperty("--rlg-extra-data-title-bg", extraDataTitle.backgroundColor.value.value);
        style.setProperty("--rlg-extra-data-toggle-color", extraDataTitle.toggleColor.value.value);
    }

    private applyReportTextStyle(style: CSSStyleDeclaration, prefix: string, settings: ReportTextStyleSettings): void {
        style.setProperty(`--rlg-report-${prefix}-font-family`, settings.fontFamily.value);
        style.setProperty(`--rlg-report-${prefix}-font-size`, `${settings.fontSize.value}px`);
        style.setProperty(`--rlg-report-${prefix}-font-weight`, settings.bold.value ? "700" : "400");
        style.setProperty(`--rlg-report-${prefix}-font-style`, settings.italic.value ? "italic" : "normal");
        style.setProperty(`--rlg-report-${prefix}-text-decoration`, settings.underline.value ? "underline" : "none");
        style.setProperty(`--rlg-report-${prefix}-align`, settings.alignment.value);
        style.setProperty(`--rlg-report-${prefix}-color`, settings.color.value.value);
        style.setProperty(`--rlg-report-${prefix}-bg`, settings.backgroundColor.value.value);
    }

    private applyWindowLine(style: CSSStyleDeclaration, prefix: string, visible: boolean, color: string, width: number): void {
        style.setProperty(`--rlg-${prefix}-window-border`, visible ? `${Math.max(0, width)}px solid ${color}` : "0 solid transparent");
    }

    private formatReportNumber(value: string): string {
        const decimals = Math.max(0, Math.min(6, this.formattingSettings.reportTextCard.decimals.value));
        const numeric = this.parseMetric(value);
        if (!Number.isFinite(numeric)) {
            return value;
        }
        return numeric.toLocaleString(this.locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    }

    private colorWithTransparency(color: string, transparency: number): string {
        const normalized = color.trim().replace(/^#/, "");
        const hex = normalized.length === 3 ? normalized.split("").map((character) => character + character).join("") : normalized;
        const alpha = 1 - Math.max(0, Math.min(100, transparency)) / 100;
        if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
            return color;
        }
        return `rgba(${Number.parseInt(hex.slice(0, 2), 16)}, ${Number.parseInt(hex.slice(2, 4), 16)}, ${Number.parseInt(hex.slice(4, 6), 16)}, ${alpha})`;
    }

    private renderEmpty(message: string, target: HTMLElement): void {
        const emptyNode = document.createElement("div");
        emptyNode.className = "rlg-empty";
        emptyNode.textContent = message;
        target.appendChild(emptyNode);
    }

    private renderDebugCard(table: DataViewTable): HTMLElement {
        const card = document.createElement("div");
        card.className = "rlg-table-card rlg-debug-card";
        const rows = table.rows || [];

        const title = document.createElement("div");
        title.className = "rlg-table-card-title rlg-window-title";
        title.textContent = this.localize("UI_DebugTable");
        card.appendChild(title);

        const meta = document.createElement("div");
        meta.className = "rlg-debug-meta";
        meta.textContent = this.localize("UI_ColumnsRows").replace("{0}", String(table.columns.length)).replace("{1}", String(rows.length));
        card.appendChild(meta);

        const wrap = document.createElement("div");
        wrap.className = "rlg-table-wrap rlg-debug-wrap";
        const debugHeight = this.getPaneHeight("debug", 220);
        wrap.style.height = `${debugHeight}px`;
        wrap.style.maxHeight = `${debugHeight}px`;

        const debugTable = document.createElement("table");
        debugTable.className = "rlg-table";

        const thead = document.createElement("thead");
        const headRow = document.createElement("tr");
        for (const column of table.columns) {
            const th = document.createElement("th");
            const roleNames = Object.keys(column.roles || {}).join(", ") || "-";
            th.textContent = `${column.displayName || column.queryName || this.localize("UI_Unknown")} [${this.localize("UI_Role")}: ${roleNames}, ${this.localize("UI_Index")}: ${column.index ?? "-"}]`;
            headRow.appendChild(th);
        }
        thead.appendChild(headRow);
        debugTable.appendChild(thead);

        const tbody = document.createElement("tbody");
        for (const row of rows) {
            const tr = document.createElement("tr");
            for (const value of row) {
                const td = document.createElement("td");
                td.textContent = value === null || value === undefined ? "" : String(value);
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
        debugTable.appendChild(tbody);

        wrap.appendChild(debugTable);
        card.appendChild(wrap);
        return card;
    }

    private renderDnTOverviewCard(
        metingViews: MetingView[],
        rowDefinitions: RowDefinition[],
        dnTIndex: number,
        labelColumns: MetingLabelColumnDef[],
        singleValueColumns: SingleValueColumnDef[]
    ): HTMLElement {
        const dnTDefinition = rowDefinitions[dnTIndex];
        const detailDefinitions = rowDefinitions.filter((_, index) => index !== dnTIndex);
        const frequencies = this.getFrequenciesInDataOrder(metingViews.flatMap((view) => view.frequencies));

        const card = document.createElement("div");
        card.className = "rlg-table-card";

        const title = document.createElement("div");
        title.className = "rlg-table-card-title rlg-window-title";
        const titleText = document.createElement("span");
        this.appendHtmlRichText(titleText, this.formattingSettings.tableTitleStyleCard.titleText.value);
        title.appendChild(titleText);
        const heightButton = document.createElement("button");
        heightButton.className = "rlg-table-height-button";
        heightButton.type = "button";
        title.appendChild(heightButton);
        const collapseDetailsButton = document.createElement("button");
        collapseDetailsButton.className = "rlg-table-collapse-details-button";
        collapseDetailsButton.type = "button";
        collapseDetailsButton.textContent = "-";
        collapseDetailsButton.title = this.localize("UI_CloseAllDetails");
        collapseDetailsButton.setAttribute("aria-label", collapseDetailsButton.title);
        title.appendChild(collapseDetailsButton);
        card.appendChild(title);

        const wrap = document.createElement("div");
        wrap.className = "rlg-table-wrap";
        const tableHeight = this.getPaneHeight(
            "table",
            this.getDefaultTableHeight(metingViews.length)
        );
        wrap.style.height = `${tableHeight}px`;
        wrap.style.maxHeight = `${tableHeight}px`;

        heightButton.addEventListener("click", () => {
            const visibleTable = wrap.querySelector<HTMLTableElement>(".rlg-table");
            if (!visibleTable) {
                return;
            }
            this.paneHeights.set(
                "table",
                this.getMeasuredTableHeight(visibleTable, "tbody > tr")
            );
            this.requestRerender();
        });

        collapseDetailsButton.addEventListener("click", () => {
            const visibleTable = wrap.querySelector<HTMLTableElement>(".rlg-table");
            if (!visibleTable) {
                return;
            }
            this.expandedMetingKeys.clear();
            this.paneHeights.set("table", this.getMeasuredTableHeight(visibleTable, "tbody > tr.rlg-summary-row"));
            this.requestRerender();
        });

        const table = document.createElement("table");
        table.className = "rlg-table";

        const thead = document.createElement("thead");
        const groupHeadRow = document.createElement("tr");
        const frequencyHeadRow = document.createElement("tr");

        labelColumns.forEach((labelColumn, index) => {
            const th = document.createElement("th");
            th.className = `rlg-row-key rlg-frozen-col ${this.getLabelColumnClass(labelColumn.header, index)}`;
            th.dataset.frozenColumnIndex = String(index);
            th.rowSpan = 2;
            th.classList.add("rlg-sortable-col");
            th.tabIndex = 0;
            th.title = this.localize("UI_SortColumn");
            th.setAttribute("aria-label", `${this.localize("UI_SortColumn")}: ${labelColumn.header}`);
            th.setAttribute("aria-sort", this.sortLabelIndex !== index ? "none" : this.sortAscending ? "ascending" : "descending");
            const sortColumn = (): void => {
                if (this.sortLabelIndex !== index) {
                    this.sortLabelIndex = index;
                    this.sortAscending = true;
                } else if (this.sortAscending) {
                    this.sortAscending = false;
                } else {
                    this.sortLabelIndex = null;
                }
                this.requestRerender();
            };
            th.addEventListener("click", sortColumn);
            this.bindKeyboardActivation(th, sortColumn);
            this.appendHtmlRichText(
                th,
                this.getConfiguredColumnName(this.getLabelColumnStyleKey(labelColumn.header, index), labelColumn.header)
            );
            if (this.sortLabelIndex === index) {
                const indicator = document.createElement("span");
                indicator.className = "rlg-sort-indicator";
                indicator.textContent = this.sortAscending ? "\u25B2" : "\u25BC";
                th.appendChild(indicator);
            }
            groupHeadRow.appendChild(th);
        });

        const thToggle = document.createElement("th");
        thToggle.className = "rlg-row-key rlg-expand-col rlg-col-info rlg-frozen-col";
        thToggle.dataset.frozenColumnIndex = String(labelColumns.length);
        thToggle.rowSpan = 2;
        thToggle.textContent = "";
        groupHeadRow.appendChild(thToggle);


        if (singleValueColumns.length > 0) {
            for (const [singleValueIndex, singleValueColumn] of singleValueColumns.entries()) {
                const thSingle = document.createElement("th");
                thSingle.className = `${this.getSingleValueColumnClass(singleValueColumn.role)} rlg-frozen-col`;
                thSingle.dataset.frozenColumnIndex = String(labelColumns.length + this.getInfoColumnCount() + singleValueIndex);
                thSingle.rowSpan = 2;
                this.appendHtmlRichText(
                    thSingle,
                    this.getConfiguredColumnName(this.getSingleValueStyleKey(singleValueColumn.role), singleValueColumn.label)
                );
                groupHeadRow.appendChild(thSingle);
            }
        }

        const frequencyGroupHeader = document.createElement("th");
        frequencyGroupHeader.className = "rlg-col-frequency rlg-frequency-group-header";
        frequencyGroupHeader.colSpan = frequencies.length;
        this.appendHtmlRichText(
            frequencyGroupHeader,
            this.getFrequencyGroupTitle()
        );
        groupHeadRow.appendChild(frequencyGroupHeader);

        for (const frequency of frequencies) {
            const th = document.createElement("th");
            th.className = "rlg-col-frequency";
            th.textContent = frequency;
            frequencyHeadRow.appendChild(th);
        }
        thead.appendChild(groupHeadRow);
        thead.appendChild(frequencyHeadRow);
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        for (const metingView of metingViews) {
            const isExpanded = this.expandedMetingKeys.has(metingView.metingKey);

            const summaryRow = document.createElement("tr");
            summaryRow.className = this.selectedGraphSeries.has(metingView.metingKey)
                ? "rlg-summary-row rlg-summary-row-selected"
                : "rlg-summary-row";
            summaryRow.tabIndex = 0;
            summaryRow.setAttribute("aria-selected", String(this.selectedGraphSeries.has(metingView.metingKey)));
            summaryRow.setAttribute("aria-label", `${this.localize("UI_SelectMeasurement")}: ${metingView.labelParts.map((part) => part.text).join(", ")}`);
            this.bindContextMenu(summaryRow, metingView.selectionId);
            summaryRow.addEventListener("click", (event: MouseEvent) => {
                this.toggleGraphSeries(metingView.metingKey, metingView.selectionId, event.ctrlKey);
            });
            this.bindKeyboardActivation(summaryRow, (event) => this.toggleGraphSeries(metingView.metingKey, metingView.selectionId, event.ctrlKey));
            const toggleHandler = (): void => {
                if (this.expandedMetingKeys.has(metingView.metingKey)) {
                    this.expandedMetingKeys.delete(metingView.metingKey);
                } else {
                    this.expandedMetingKeys.add(metingView.metingKey);
                }
                this.requestRerender();
            };

            metingView.labelParts.forEach((labelPart, index) => {
                const cell = document.createElement("td");
                cell.className = `rlg-row-key rlg-summary-row-key rlg-frozen-col ${this.getLabelColumnClass(labelPart.header, index)}`;
                cell.dataset.frozenColumnIndex = String(index);

                const labelWrap = document.createElement("span");
                labelWrap.className = "rlg-summary-label-text";

                const swatch = this.renderColorSwatch(labelPart.swatchColorHex);
                if (swatch) {
                    labelWrap.appendChild(swatch);
                }

                const labelText = document.createElement("span");
                labelText.textContent = labelPart.text;
                labelWrap.appendChild(labelText);
                cell.appendChild(labelWrap);

                summaryRow.appendChild(cell);
            });

            const toggleCell = document.createElement("td");
            toggleCell.className = "rlg-row-key rlg-expand-col rlg-col-info rlg-frozen-col";
            toggleCell.dataset.frozenColumnIndex = String(labelColumns.length);
            const toggle = document.createElement("button");
            toggle.type = "button";
            toggle.className = isExpanded ? "rlg-expand-icon rlg-expand-icon-active" : "rlg-expand-icon";
            toggle.textContent = "i";
            toggle.title = isExpanded ? this.localize("UI_HideDetails") : this.localize("UI_ShowDetails");
            toggle.setAttribute("aria-label", `${toggle.title}: ${metingView.labelParts.map((part) => part.text).join(", ")}`);
            toggle.setAttribute("aria-expanded", String(isExpanded));
            toggle.addEventListener("click", (event: MouseEvent) => {
                event.stopPropagation();
                toggleHandler();
            });
            toggleCell.appendChild(toggle);

            if (metingView.warnings.length > 0) {
                const warningIcon = document.createElement("span");
                warningIcon.className = "rlg-warning-icon";
                warningIcon.textContent = "!";
                warningIcon.title = metingView.warnings.join("\n");
                toggleCell.appendChild(warningIcon);
            }

            summaryRow.appendChild(toggleCell);

            for (const [singleValueIndex, singleValueColumn] of singleValueColumns.entries()) {
                const singleValueCell = document.createElement("td");
                singleValueCell.className = `rlg-cell rlg-frozen-col ${this.getSingleValueColumnClass(singleValueColumn.role)}`;
                singleValueCell.dataset.frozenColumnIndex = String(labelColumns.length + this.getInfoColumnCount() + singleValueIndex);
                singleValueCell.textContent = metingView.singleValues.get(singleValueColumn.role) || "";
                summaryRow.appendChild(singleValueCell);
            }

            for (const frequency of frequencies) {
                const td = document.createElement("td");
                td.className = "rlg-cell rlg-col-frequency";
                td.textContent =
                    metingView.matrix.get(this.buildRowFrequencyKey(dnTDefinition.role, frequency)) || "";
                summaryRow.appendChild(td);
            }
            tbody.appendChild(summaryRow);

            if (isExpanded) {
                for (const detailDefinition of detailDefinitions) {
                    const detailRow = document.createElement("tr");
                    detailRow.className = "rlg-detail-row";
                    this.bindContextMenu(detailRow, metingView.selectionId);

                    const detailLabel = document.createElement("td");
                    detailLabel.className = "rlg-row-key rlg-detail-row-key rlg-col-description rlg-frozen-detail";
                    detailLabel.colSpan = labelColumns.length + this.getInfoColumnCount() + singleValueColumns.length;
                    this.appendHtmlRichText(detailLabel, detailDefinition.label);
                    detailRow.appendChild(detailLabel);

                    for (const frequency of frequencies) {
                        const td = document.createElement("td");
                        td.className = "rlg-cell rlg-col-frequency";
                        td.textContent =
                            metingView.matrix.get(this.buildRowFrequencyKey(detailDefinition.role, frequency)) || "";
                        detailRow.appendChild(td);
                    }
                    tbody.appendChild(detailRow);
                }
            }
        }
        table.appendChild(tbody);

        wrap.appendChild(table);
        card.appendChild(wrap);
        this.scheduleLayout(() => {
            this.applyFrozenColumns(table, labelColumns.length + this.getInfoColumnCount() + singleValueColumns.length);
            this.updateTableHeightControls(heightButton, collapseDetailsButton, wrap, table);
        });
        return card;
    }

    private applyFrozenColumns(table: HTMLTableElement, frozenColumnCount: number): void {
        let left = 0;
        for (let index = 0; index < frozenColumnCount; index += 1) {
            const cells = table.querySelectorAll<HTMLElement>(`[data-frozen-column-index="${index}"]`);
            const headerCell = table.querySelector<HTMLElement>(`thead [data-frozen-column-index="${index}"]`);
            if (!headerCell) {
                continue;
            }
            for (const cell of Array.from(cells)) {
                cell.style.left = `${left}px`;
                cell.classList.toggle("rlg-frozen-col-last", index === frozenColumnCount - 1);
            }
            left += headerCell.getBoundingClientRect().width;
        }
        table.style.setProperty("--rlg-frozen-columns-width", `${left}px`);
    }

    private getLabelColumnClass(header: string, index: number): string {
        return `rlg-col-${this.getLabelColumnStyleKey(header, index)}`;
    }

    private getLabelColumnStyleKey(header: string, index: number): string {
        return `label${Math.max(0, Math.min(9, index))}`;
    }

    private getSingleValueColumnClass(role: string): string {
        return `rlg-col-${this.getSingleValueStyleKey(role).replace("dnTAKRoom", "dntak-room").replace("dnTAKArea", "dntak-area").replace("dnTA", "dnta")}`;
    }

    private getSingleValueStyleKey(role: string): string {
        if (role === "dnTA") {
            return "dnTA";
        }
        if (role === "dnTAKVerblijfsruimte") {
            return "dnTAKRoom";
        }
        return "dnTAKArea";
    }

    private getConfiguredColumnName(styleKey: string, fieldDisplayName: string): string {
        const configuredName = this.formattingSettings.tableColumnsCard.getStyle(styleKey).columnName.value.trim();
        return configuredName.length > 0 ? configuredName : fieldDisplayName;
    }

    private getFrequencyGroupTitle(): string {
        return this.getConfiguredColumnName("frequency", "DnT");
    }

    private getSingleValueRoleLabel(role: string, fallback: string): string {
        const column = this.lastUpdateOptions?.dataViews?.[0]?.table?.columns.find((candidate) => candidate.roles?.[role]);
        return this.getConfiguredColumnName(this.getSingleValueStyleKey(role), column?.displayName?.trim() || fallback);
    }

    private updateTableHeightControls(
        heightButton: HTMLButtonElement,
        collapseDetailsButton: HTMLButtonElement,
        wrap: HTMLElement,
        table: HTMLTableElement
    ): void {
        const fittedHeight = this.getMeasuredTableHeight(table, "tbody > tr");
        const heightDifference = fittedHeight - this.getTableViewportHeight(wrap);
        const canResize = Math.abs(heightDifference) > 1;
        heightButton.hidden = !canResize;
        if (canResize) {
            const isContentOverflowing = heightDifference > 0;
            heightButton.classList.toggle("rlg-table-height-button-expand", isContentOverflowing);
            heightButton.classList.toggle("rlg-table-height-button-collapse", !isContentOverflowing);
            heightButton.title = this.localize(isContentOverflowing ? "UI_ExpandTable" : "UI_CollapseTable");
            heightButton.setAttribute("aria-label", heightButton.title);
        }
        collapseDetailsButton.hidden = table.querySelector("tbody > tr.rlg-detail-row") === null;
    }

    private buildMetingViews(
        table: DataViewTable,
        rows: ParsedRow[],
        rowDefinitions: RowDefinition[],
        labelColumnDefs: MetingLabelColumnDef[],
        metingColIndexes: number[]
    ): { views: MetingView[]; conflictError: string | null } {
        if (metingColIndexes.length === 0) {
            return { views: [], conflictError: null };
        }

        const keyColIndexes = metingColIndexes.slice(0, 2);
        const otherColIndexes = metingColIndexes.slice(keyColIndexes.length);

        const rowsByPrimary = new Map<string, ParsedRow[]>();
        const keyValuesByPrimary = new Map<string, Map<number, string>>();
        const primaryOrder: string[] = [];
        for (const row of rows) {
            const keyValues = keyColIndexes.map((colIndex) => row.metingValues.get(colIndex) || "");
            if (keyValues[0].length === 0) {
                continue;
            }
            const primaryValue = keyValues.join(" | ");
            if (!rowsByPrimary.has(primaryValue)) {
                rowsByPrimary.set(primaryValue, []);
                keyValuesByPrimary.set(primaryValue, new Map(keyColIndexes.map((colIndex, index) => [colIndex, keyValues[index]])));
                primaryOrder.push(primaryValue);
            }
            rowsByPrimary.get(primaryValue)!.push(row);
        }

        // Every other Meting field must resolve to at most one distinct value per primary value;
        // conflicting values mean the data isn't consistent enough to build a single row.
        const conflicts: string[] = [];
        const resolvedOtherValuesByPrimary = new Map<string, Map<number, string>>();

        for (const primaryValue of primaryOrder) {
            const groupRows = rowsByPrimary.get(primaryValue)!;
            const resolved = new Map<number, string>();

            for (const colIndex of otherColIndexes) {
                const distinctValues = new Set<string>();
                for (const row of groupRows) {
                    const value = row.metingValues.get(colIndex) || "";
                    if (value.length > 0) {
                        distinctValues.add(value);
                    }
                }

                if (distinctValues.size > 1) {
                    const fieldLabel = this.findLabelForColIndex(labelColumnDefs, colIndex);
                    conflicts.push(`"${primaryValue}" heeft meerdere waarden voor "${fieldLabel}": ${Array.from(distinctValues).join(", ")}`);
                } else if (distinctValues.size === 1) {
                    resolved.set(colIndex, Array.from(distinctValues)[0]);
                }
            }

            resolvedOtherValuesByPrimary.set(primaryValue, resolved);
        }

        if (conflicts.length > 0) {
            return { views: [], conflictError: conflicts.join(" | ") };
        }

        const metingViews: MetingView[] = [];
        for (const primaryValue of primaryOrder) {
            const groupRows = rowsByPrimary.get(primaryValue)!;
            const resolvedOthers = resolvedOtherValuesByPrimary.get(primaryValue)!;

            const metingValues = new Map<number, string>(keyValuesByPrimary.get(primaryValue)!);
            for (const [colIndex, value] of resolvedOthers) {
                metingValues.set(colIndex, value);
            }

            const labelParts = labelColumnDefs.map((def) => {
                const text = def.colIndex !== null ? metingValues.get(def.colIndex) || "" : "";
                const rawSwatchValue =
                    def.colorSourceColIndex !== null ? metingValues.get(def.colorSourceColIndex) || "" : "";
                return {
                    header: def.header,
                    text,
                    swatchColorHex: this.isValidHexColor(rawSwatchValue) ? rawSwatchValue.trim() : null
                };
            });

            const frequencies = this.getFrequenciesInDataOrder(groupRows.map((row) => row.frequency));
            const singleValues = new Map<string, string>();
            for (const role of SINGLE_VALUE_ROLES) {
                const resolvedValue = groupRows.map((row) => row.singleValues.get(role) || "").find((value) => value.length > 0) || "";
                singleValues.set(role, resolvedValue);
            }
            const measurementDetails = new Map<number, string>();
            for (const colIndex of groupRows[0].measurementDetailValues.keys()) {
                const resolvedValue = groupRows
                    .map((row) => row.measurementDetailValues.get(colIndex) || "")
                    .find((value) => value.length > 0) || "";
                measurementDetails.set(colIndex, resolvedValue);
            }
            const topDetails = new Map<number, string>();
            for (const colIndex of groupRows[0].topDetailValues.keys()) {
                const resolvedValue = groupRows
                    .map((row) => row.topDetailValues.get(colIndex) || "")
                    .find((value) => value.length > 0) || "";
                topDetails.set(colIndex, resolvedValue);
            }
            const warnings = Array.from(
                new Set(
                    groupRows.flatMap((row) => Array.from(row.warningValues.values())).filter((value) => value.length > 0)
                )
            );
            const matrix = new Map<string, string>();
            let hasAnyValue = false;
            for (const row of groupRows) {
                for (const rowDefinition of rowDefinitions) {
                    const value = rowDefinition.selector(row);
                    if (value.length === 0) {
                        continue;
                    }
                    hasAnyValue = true;
                    matrix.set(this.buildRowFrequencyKey(rowDefinition.role, row.frequency), value);
                }
            }

            if (hasAnyValue) {
                const sourceIndex = groupRows[0].sourceIndex;
                const selectionId = this.host.createSelectionIdBuilder().withTable(table, sourceIndex).createSelectionId();
                metingViews.push({
                    metingKey: primaryValue,
                    selectionId,
                    labelParts,
                    singleValues,
                    measurementDetails,
                    topDetails,
                    warnings,
                    frequencies,
                    matrix
                });
            }
        }

        return { views: metingViews, conflictError: null };
    }

    private findLabelForColIndex(labelColumnDefs: MetingLabelColumnDef[], colIndex: number): string {
        const match = labelColumnDefs.find((def) => def.colIndex === colIndex);
        return match?.header || `kolom ${colIndex}`;
    }

    private getRoleIndexes(columns: DataViewMetadataColumn[]): RoleIndexes | null {
        const byRole = (roleName: string): number => columns.findIndex((col) => Boolean(col.roles?.[roleName]));
        // table.columns' array order doesn't always follow the current field-well order after
        // reordering; column.index reflects the live select-statement position, so sort by that.
        const byRoleAll = (roleName: string): number[] =>
            columns
                .map((col, index) => (Boolean(col.roles?.[roleName]) ? index : -1))
                .filter((index) => index >= 0)
                .sort((a, b) => (columns[a].index ?? a) - (columns[b].index ?? b));

        const singleValues = new Map<string, number>();
        for (const role of SINGLE_VALUE_ROLES) {
            singleValues.set(role, byRole(role));
        }

        const indexes: RoleIndexes = {
            meting: byRoleAll("meting"),
            frequency: byRole("frequency"),
            dnT: byRole("dnT"),
            singleValues,
            columnVisibility: byRole("columnVisibility"),
            detail: byRoleAll("detail"),
            measurementDetails: byRoleAll("measurementDetails"),
            topDetails: byRoleAll("topDetails"),
            warning: byRoleAll("warning")
        };

        const allFound =
            indexes.meting.length > 0 && indexes.frequency >= 0 && (indexes.dnT >= 0 || indexes.detail.length > 0);

        return allFound ? indexes : null;
    }

    private buildMetingLabelColumnDefs(table: DataViewTable, idx: RoleIndexes): MetingLabelColumnDef[] {
        const defs: MetingLabelColumnDef[] = [];
        let pendingColorColIndex: number | null = null;

        for (const colIndex of idx.meting) {
            const sampleValue = this.findFirstNonBlankValue(table, colIndex);
            if (this.isValidHexColor(sampleValue)) {
                pendingColorColIndex = colIndex;
                continue;
            }

            defs.push({
                colIndex,
                header: table.columns[colIndex].displayName,
                colorSourceColIndex: pendingColorColIndex
            });
            pendingColorColIndex = null;
        }

        if (pendingColorColIndex !== null) {
            defs.push({
                colIndex: null,
                header: table.columns[pendingColorColIndex].displayName,
                colorSourceColIndex: pendingColorColIndex
            });
        }

        return defs;
    }

    private findFirstNonBlankValue(table: DataViewTable, colIndex: number): string {
        for (const row of table.rows || []) {
            const text = this.toText(row[colIndex]);
            if (text.length > 0) {
                return text;
            }
        }
        return "";
    }

    private parseRows(table: DataViewTable, idx: RoleIndexes): ParsedRow[] {
        const output: ParsedRow[] = [];
        const dnTFormatter = this.createMetricValueFormatter(table.columns[idx.dnT]);
        const singleValueFormatters = new Map<string, valueFormatter.IValueFormatter | null>();
        for (const [role, colIndex] of idx.singleValues) {
            singleValueFormatters.set(role, this.createMetricValueFormatter(table.columns[colIndex]));
        }
        const detailFormatters = new Map<number, valueFormatter.IValueFormatter | null>();
        for (const colIndex of idx.detail) {
            detailFormatters.set(colIndex, this.createMetricValueFormatter(table.columns[colIndex]));
        }
        const measurementDetailFormatters = new Map<number, valueFormatter.IValueFormatter | null>();
        for (const colIndex of idx.measurementDetails) {
            measurementDetailFormatters.set(colIndex, this.createMetricValueFormatter(table.columns[colIndex]));
        }

        for (const [sourceIndex, row] of (table.rows || []).entries()) {
            const metingValues = new Map<number, string>();
            for (const colIndex of idx.meting) {
                metingValues.set(colIndex, this.toText(row[colIndex]));
            }
            const frequency = this.toText(row[idx.frequency]);
            if (!frequency) {
                continue;
            }

            const detailValues = new Map<number, string>();
            for (const colIndex of idx.detail) {
                detailValues.set(colIndex, this.rawValueToText(row[colIndex], detailFormatters.get(colIndex) || null));
            }

            const measurementDetailValues = new Map<number, string>();
            for (const colIndex of idx.measurementDetails) {
                measurementDetailValues.set(
                    colIndex,
                    this.rawValueToText(row[colIndex], measurementDetailFormatters.get(colIndex) || null)
                );
            }

            const topDetailValues = new Map<number, string>();
            for (const colIndex of idx.topDetails) {
                topDetailValues.set(
                    colIndex,
                    this.rawValueToText(row[colIndex], measurementDetailFormatters.get(colIndex) || null)
                );
            }

            const singleValues = new Map<string, string>();
            for (const [role, colIndex] of idx.singleValues) {
                singleValues.set(
                    role,
                    colIndex >= 0 ? this.rawValueToText(row[colIndex], singleValueFormatters.get(role) || null) : ""
                );
            }

            const warningValues = new Map<number, string>();
            for (const colIndex of idx.warning) {
                warningValues.set(colIndex, this.toText(row[colIndex]));
            }

            output.push({
                sourceIndex,
                metingValues,
                frequency,
                dnT: idx.dnT >= 0 ? this.rawValueToText(row[idx.dnT], dnTFormatter) : "",
                singleValues,
                detailValues,
                measurementDetailValues,
                topDetailValues,
                warningValues
            });
        }
        return output;
    }

    private createMetricValueFormatter(column: DataViewMetadataColumn | undefined): valueFormatter.IValueFormatter | null {
        // Prefer the field's own Data format (set via right-click > Format on the field);
        // fall back to the visual's own Decimalen setting when no format string is present.
        if (column?.format) {
            return valueFormatter.create({ format: column.format });
        }

        const decimals = Math.max(0, Math.round(this.formattingSettings.generalStyleCard.decimals.value ?? 1));
        const format = decimals > 0 ? `#,0.${"0".repeat(decimals)}` : "#,0";
        return valueFormatter.create({ format });
    }

    private rawValueToText(value: powerbi.PrimitiveValue, formatter: valueFormatter.IValueFormatter | null): string {
        if (value === null || value === undefined) {
            return "";
        }

        if (typeof value === "number" && Number.isFinite(value)) {
            return formatter ? formatter.format(value) : String(value);
        }

        return String(value);
    }

    private toText(value: powerbi.PrimitiveValue): string {
        if (value === null || value === undefined) {
            return "";
        }
        return String(value).trim();
    }

    private buildRowFrequencyKey(rowLabel: string, frequency: string): string {
        return `${rowLabel}||${frequency}`;
    }

    private getFrequenciesInDataOrder(values: string[]): string[] {
        return Array.from(new Set(values.filter((value) => value.length > 0)));
    }

    private isValidHexColor(value: string): boolean {
        return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());
    }

    private renderColorSwatch(colorHex: string | null): HTMLElement | null {
        if (!colorHex || !this.isValidHexColor(colorHex)) {
            return null;
        }

        const swatch = document.createElement("span");
        swatch.className = "rlg-color-swatch";
        swatch.style.backgroundColor = colorHex.trim();
        return swatch;
    }
}

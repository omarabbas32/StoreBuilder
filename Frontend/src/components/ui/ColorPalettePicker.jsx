import { useState } from 'react';
import { GripVertical, Plus, X, Check } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Button from './Button';
import ContrastChecker from './ContrastChecker';
import { getHarmonySteps } from '../../utils/contrast';
import './ColorPalettePicker.css';

const PRESET_COLORS = [
    '#2563eb', // Blue
    '#7c3aed', // Purple
    '#dc2626', // Red
    '#ea580c', // Orange
    '#16a34a', // Green
    '#0891b2', // Cyan
    '#db2777', // Pink
    '#f59e0b', // Amber
    '#111827', // Dark Gray
];

const ColorPalettePicker = ({
    value = [],
    onChange,
    label = 'Color Palette',
    maxColors = 12,
    allowReorder = true,
    themes = [] // New prop for global theme presets
}) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [showAddColor, setShowAddColor] = useState(false);
    const [newColor, setNewColor] = useState('#2563eb');

    // Initialize with default colors if empty
    const colors = value.length > 0 ? value : [PRESET_COLORS[0]];

    const handleDragEnd = (result) => {
        if (!result.destination || !allowReorder) return;

        const items = Array.from(colors);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        onChange(items);
        // Update selected index if needed
        if (selectedIndex === result.source.index) {
            setSelectedIndex(result.destination.index);
        } else if (
            selectedIndex > result.source.index &&
            selectedIndex <= result.destination.index
        ) {
            setSelectedIndex(selectedIndex - 1);
        } else if (
            selectedIndex < result.source.index &&
            selectedIndex >= result.destination.index
        ) {
            setSelectedIndex(selectedIndex + 1);
        }
    };

    const handleAddColor = () => {
        if (colors.length >= maxColors) return;

        const newColors = [...colors, newColor];
        onChange(newColors);
        setSelectedIndex(newColors.length - 1);
        setNewColor('#2563eb');
        setShowAddColor(false);
    };

    const handleRemoveColor = (index) => {
        if (colors.length <= 1) return; // Keep at least one color

        const newColors = colors.filter((_, i) => i !== index);
        onChange(newColors);

        // Adjust selected index
        if (selectedIndex >= newColors.length) {
            setSelectedIndex(newColors.length - 1);
        } else if (selectedIndex > index) {
            setSelectedIndex(selectedIndex - 1);
        }
    };

    const handleUpdateColor = (index, color) => {
        const newColors = [...colors];
        newColors[index] = color;
        onChange(newColors);
    };

    const handlePresetClick = (presetColor) => {
        if (colors.length >= maxColors) {
            // Replace selected color
            handleUpdateColor(selectedIndex, presetColor);
        } else {
            // Add new color
            onChange([...colors, presetColor]);
            setSelectedIndex(colors.length);
        }
    };

    const selectedColor = colors[selectedIndex] || colors[0];

    return (
        <div className="color-palette-picker">
            {label && <label className="palette-label">{label}</label>}

            <div className="palette-main-section">
                {/* Draggable Color List */}
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="color-palette" direction="horizontal">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="color-palette-list"
                            >
                                {colors.map((color, index) => (
                                    <Draggable
                                        key={`color-${index}`}
                                        draggableId={`color-${index}`}
                                        index={index}
                                        isDragDisabled={!allowReorder}
                                    >
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={`color-item-wrapper ${snapshot.isDragging ? 'dragging' : ''
                                                    } ${selectedIndex === index ? 'selected' : ''}`}
                                            >
                                                {allowReorder && (
                                                    <div
                                                        {...provided.dragHandleProps}
                                                        className="color-drag-handle"
                                                    >
                                                        <GripVertical size={16} />
                                                    </div>
                                                )}
                                                <div
                                                    className="color-swatch"
                                                    style={{ backgroundColor: color }}
                                                    onClick={() => setSelectedIndex(index)}
                                                >
                                                    {selectedIndex === index && (
                                                        <Check size={14} color="white" />
                                                    )}
                                                </div>
                                                {colors.length > 1 && (
                                                    <button
                                                        className="remove-color-btn"
                                                        onClick={() => handleRemoveColor(index)}
                                                        type="button"
                                                        aria-label="Remove color"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>

                {/* Selected Color Editor */}
                <div className="color-editor">
                    <div className="selected-color-display">
                        <div
                            className="selected-color-preview"
                            style={{ backgroundColor: selectedColor }}
                        />
                        <input
                            type="color"
                            value={selectedColor}
                            onChange={(e) => handleUpdateColor(selectedIndex, e.target.value)}
                            className="color-input"
                        />
                        <span className="color-hex">{selectedColor}</span>
                    </div>

                    <ContrastChecker color={selectedColor} background="#ffffff" />

                    {/* Harmony Suggestions */}
                    <div className="harmony-suggestions">
                        <span className="preset-label">Harmony Suggetions:</span>
                        <div className="harmony-options">
                            {['analogous', 'triadic', 'complementary', 'monochromatic'].map(mode => (
                                <div key={mode} className="harmony-row">
                                    <span className="harmony-mode-label">{mode}</span>
                                    <div className="harmony-colors">
                                        {getHarmonySteps(selectedColor, mode).map((c, i) => (
                                            <div
                                                key={i}
                                                className="harmony-color-swatch"
                                                style={{ backgroundColor: c }}
                                                onClick={() => handleUpdateColor(selectedIndex, c)}
                                                title={`Click to use ${c}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Global Themes */}
                    {themes.length > 0 && (
                        <div className="global-themes">
                            <span className="preset-label">Global Themes:</span>
                            <div className="theme-presets-grid">
                                {themes.map((theme, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        className="theme-preset-btn"
                                        onClick={() => onChange(theme.colors)}
                                        title={theme.name}
                                    >
                                        <div className="theme-preview">
                                            {theme.colors.slice(0, 3).map((c, i) => (
                                                <div
                                                    key={i}
                                                    style={{ backgroundColor: c }}
                                                    className="theme-color-strip"
                                                />
                                            ))}
                                        </div>
                                        <span className="theme-name-small">{theme.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Preset Colors */}
                    <div className="preset-colors">
                        <span className="preset-label">Quick Add:</span>
                        <div className="preset-grid">
                            {PRESET_COLORS.filter(
                                (preset) => !colors.includes(preset)
                            ).map((preset) => (
                                <button
                                    key={preset}
                                    type="button"
                                    className="preset-color-btn"
                                    style={{ backgroundColor: preset }}
                                    onClick={() => handlePresetClick(preset)}
                                    aria-label={`Add color ${preset}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Add Custom Color */}
                    {colors.length < maxColors && (
                        <div className="add-color-section">
                            {!showAddColor ? (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setShowAddColor(true)}
                                >
                                    <Plus size={16} />
                                    Add Color
                                </Button>
                            ) : (
                                <div className="add-color-input">
                                    <input
                                        type="color"
                                        value={newColor}
                                        onChange={(e) => setNewColor(e.target.value)}
                                        className="color-input"
                                    />
                                    <Button size="sm" onClick={handleAddColor}>
                                        Add
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => {
                                            setShowAddColor(false);
                                            setNewColor('#2563eb');
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {colors.length >= maxColors && (
                <p className="max-colors-warning">
                    Maximum {maxColors} colors reached. Remove a color to add more.
                </p>
            )}
        </div>
    );
};

export default ColorPalettePicker;


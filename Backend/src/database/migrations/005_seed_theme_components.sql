-- Seed Sydney Components
INSERT INTO components (name, type, content_schema, screenshot_url)
VALUES 
(
    'Sydney Hero', 
    'hero', 
    '{
        "fields": [
            {"name": "title", "type": "text", "label": "Main Title"},
            {"name": "subtitle", "type": "text", "label": "Subtitle"},
            {"name": "image", "type": "image", "label": "Background Image"},
            {"name": "ctaText", "type": "text", "label": "Button Text"}
        ]
    }',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=400'
),
(
    'Sydney Highlight', 
    'highlight', 
    '{
        "fields": [
            {"name": "title", "type": "text", "label": "Title"},
            {"name": "description", "type": "textarea", "label": "Description"},
            {"name": "image", "type": "image", "label": "Main Image"},
            {"name": "miniImage", "type": "image", "label": "Mini Overlay Image"}
        ]
    }',
    'https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?auto=format&fit=crop&q=80&w=400'
),
(
    'Sydney Product Grid', 
    'product_grid', 
    '{
        "fields": [
            {"name": "title", "type": "text", "label": "Section Title"},
            {"name": "limit", "type": "number", "label": "Products to show", "default": 4}
        ]
    }',
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=400'
),
(
    'Sydney Attributes', 
    'attributes', 
    '{
        "fields": [
             {"name": "showIcons", "type": "boolean", "label": "Show Service Icons"}
        ]
    }',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=400'
) ON CONFLICT DO NOTHING;

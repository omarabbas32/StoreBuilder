-- Seed Sydney Theme
INSERT INTO themes (name, description, screenshot_url, config)
VALUES (
    'Sydney Theme', 
    'A premium minimalist ecommerce theme with smooth transitions and elegant typography.', 
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800',
    '{
        "primaryColor": "#B59F66",
        "fontFamily": "Inter, sans-serif",
        "headerFont": "Inria Serif, serif"
    }'
) ON CONFLICT DO NOTHING;

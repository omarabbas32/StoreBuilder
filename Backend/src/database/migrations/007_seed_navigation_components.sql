-- Seed navigation components
INSERT INTO components (name, type, description, content_schema) VALUES
('Store Navbar', 'navigation', 'Customizable navigation bar with logo and menu', 
'{"fields": [
    {"name": "logo", "label": "Logo Image", "type": "image"},
    {"name": "storeName", "label": "Store Name", "type": "text"},
    {"name": "showCart", "label": "Show Cart Icon", "type": "checkbox"},
    {"name": "menuItems", "label": "Menu Items (JSON)", "type": "textarea"}
]}'::jsonb),

('Store Footer', 'footer', 'Customizable footer with links and social media',
'{"fields": [
    {"name": "copyrightText", "label": "Copyright Text", "type": "text"},
    {"name": "aboutText", "label": "About Text", "type": "textarea"},
    {"name": "facebookUrl", "label": "Facebook URL", "type": "text"},
    {"name": "instagramUrl", "label": "Instagram URL", "type": "text"},
    {"name": "twitterUrl", "label": "Twitter URL", "type": "text"},
    {"name": "email", "label": "Contact Email", "type": "text"},
    {"name": "phone", "label": "Contact Phone", "type": "text"}
]}'::jsonb),

('Category Sidebar', 'sidebar', 'Sidebar with category navigation',
'{"fields": [
    {"name": "title", "label": "Sidebar Title", "type": "text"},
    {"name": "showCategories", "label": "Show Categories", "type": "checkbox"}
]}'::jsonb)
ON CONFLICT DO NOTHING;

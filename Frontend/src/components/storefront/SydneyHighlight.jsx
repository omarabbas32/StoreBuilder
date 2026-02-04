import { formatImageUrl } from '../../utils/imageUtils';
import EditableText from './EditableText';
import './SydneyHighlight.css';

const SydneyHighlight = ({ componentId, title, description, image, miniImage, brandColor }) => {
    return (
        <div className="sydney-highlight">
            <div className="sydney-highlight-image-wrapper">
                <img
                    src={formatImageUrl(image) || 'https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?auto=format&fit=crop&q=80&w=800'}
                    alt={title}
                    className="sydney-highlight-main-img"
                />
            </div>
            <div className="sydney-highlight-content">
                <EditableText
                    tag="h2"
                    className="sydney-highlight-title"
                    value={title}
                    componentId={componentId}
                    field="title"
                    placeholder="Luxury Knitwear"
                />
                <EditableText
                    tag="p"
                    className="sydney-highlight-description"
                    value={description}
                    componentId={componentId}
                    field="description"
                    placeholder="This soft lambswool jumper is knitted in Scotland, using yarn from one of the world oldest spinners based in Fife."
                />
                <div className="sydney-highlight-footer">
                    <button className="sydney-highlight-link" style={{ color: brandColor, borderBottomColor: brandColor }}>
                        Shop Now
                    </button>
                    <div className="sydney-highlight-mini-wrapper">
                        <img
                            src={formatImageUrl(miniImage) || 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=200'}
                            alt="Preview"
                            className="sydney-highlight-mini-img"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SydneyHighlight;

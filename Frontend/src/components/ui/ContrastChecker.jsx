import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import { getContrastRatio, getWCAGLevel } from '../../utils/contrast';
import './ContrastChecker.css';

const ContrastChecker = ({ color, background = '#ffffff' }) => {
    const ratio = getContrastRatio(color, background);
    const level = getWCAGLevel(ratio);

    let status = 'fail';
    if (level.aaa) status = 'aaa';
    else if (level.aa) status = 'aa';

    return (
        <div className={`contrast-checker status-${status}`}>
            <div className="contrast-data">
                <span className="ratio-value">{ratio.toFixed(2)}:1</span>
                <span className="ratio-label">Contrast</span>
            </div>
            <div className="wcag-indicators">
                <div className={`level-item ${level.aa ? 'pass' : 'fail'}`}>
                    {level.aa ? <ShieldCheck size={14} /> : <ShieldX size={14} />}
                    <span>AA</span>
                </div>
                <div className={`level-item ${level.aaa ? 'pass' : 'fail'}`}>
                    {level.aaa ? <ShieldCheck size={14} /> : <ShieldX size={14} />}
                    <span>AAA</span>
                </div>
            </div>
        </div>
    );
};

export default ContrastChecker;

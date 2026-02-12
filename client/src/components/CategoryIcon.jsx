import { Globe, Smartphone, Monitor, Box, Gamepad2, Layers, Grid, HelpCircle } from 'lucide-react';

const icons = {
    'web': Globe,
    'android app': Smartphone,
    'desktop app': Monitor,
    'plugin': Box,
    'minecraft plugin': Gamepad2,
    'cross platform app': Layers,
    'other': Grid
};

export default function CategoryIcon({ category, className }) {
    const normalizedCategory = category?.toLowerCase();
    const Icon = icons[normalizedCategory] || HelpCircle;

    return <Icon className={className} />;
}

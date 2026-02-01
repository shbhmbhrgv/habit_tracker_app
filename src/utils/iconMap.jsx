import { Brain, Dumbbell, Zap, Pizza, Smartphone, Star, Coffee, Moon, Book } from 'lucide-react';

export const IconMap = {
    Brain,
    Dumbbell,
    Zap,
    Pizza,
    Smartphone,
    Star,
    Coffee,
    Moon,
    Book
};

export const getIcon = (name) => {
    const Icon = IconMap[name] || Star;
    return Icon;
};

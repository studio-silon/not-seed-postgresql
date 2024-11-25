const colors = require('tailwindcss/colors');
const ColorConverter = require('./ColorConverter');

const baseColors = {
    brand: '#ee4546',
    secondary: '#25262b',
    dark: '#343a40',
    light: '#f8f9fa',
};

const baseTextColors = {
    background: '#ffffff',
    'background-text': '#000000',
    'brand-text': '#ffffff',
    'dark-text': '#ffffff',
    'light-text': '#000000',
    'secondary-text': '#ffffff',
};

const generateShades = (colors) => {
    const shades = {};
    Object.keys(colors).forEach((key) => {
        shades[key] = {
            DEFAULT: colors[key],
        };
        for (let i = 100; i <= 900; i += 100) {
            shades[key][i] = ColorConverter.createColorForShade(colors[key], i);
        }
    });
    return shades;
};

const colorsWithShades = {
    ...generateShades(baseColors),
    ...generateShades(baseTextColors),
};

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./app/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: colorsWithShades,
        },
    },
    plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
};

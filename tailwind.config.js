/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'rics-purple': '#512D6D',
                'rics-grey': '#333F48',
                'rics-burgundy': '#7D2248',
                'rics-orange': '#E87722',
                'survey-blue': '#0000A0',
                'survey-brown': '#8A4513',
                'survey-grey': '#818385',
            },
        },
    },
    plugins: [],
}

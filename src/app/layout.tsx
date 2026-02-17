import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Diagnóstico de Automatización | Volkern',
    description: 'Descubre cómo automatizar tu negocio con IA. Responde algunas preguntas y obtén un diagnóstico personalizado.',
    keywords: ['automatización', 'IA', 'chatbot', 'diagnóstico empresarial', 'Volkern'],
    authors: [{ name: 'Volkern' }],
    icons: {
        icon: '/images/DeXpert%20Icon.png',
        apple: '/images/DeXpert%20Icon.png',
    },
    openGraph: {
        title: 'Diagnóstico de Automatización | Volkern',
        description: 'Descubre cómo automatizar tu negocio con IA',
        type: 'website',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es" className="light">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="antialiased">
                {children}
            </body>
        </html>
    );
}

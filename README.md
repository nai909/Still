# Philos - Endless Philosophy Quotes

An immersive, cinematic philosophy quotes app with a unique depth-scroll effect where quotes emerge from the distance as you scroll.

![Philos Screenshot](screenshot.png)

## Features

- **🌊 Depth Scroll Effect** - Quotes emerge from the void and drift toward you as you scroll, creating a meditative experience
- **💾 Local Storage** - Your saved quotes persist across sessions
- **📱 PWA Support** - Install on mobile home screens, works offline
- **🎯 Filter by School** - Focus on Stoicism, Existentialism, Buddhism, Taoism, and 15+ other philosophical traditions
- **☀️ Daily Quote** - A new quote each day to start your morning
- **📤 Share** - Native sharing on mobile, clipboard copy on desktop
- **🌟 250+ Quotes** - From Marcus Aurelius to Alan Watts, Rumi to Camus

## Schools of Thought Included

- Stoicism (Seneca, Marcus Aurelius, Epictetus)
- Existentialism (Nietzsche, Sartre, Kierkegaard, Frankl)
- Absurdism (Camus)
- Classical Greek (Socrates, Plato, Aristotle)
- Buddhism (Buddha, Thich Nhat Hanh)
- Zen Buddhism (Dōgen, Bashō)
- Taoism (Lao Tzu, Zhuangzi)
- Sufism (Rumi, Hafiz)
- Confucianism (Confucius)
- Transcendentalism (Emerson, Thoreau)
- Depth Psychology (Jung, Campbell)
- And more...

## Quick Start

### Option 1: Create React App

```bash
npx create-react-app philos-app
cd philos-app
# Replace src/App.js with the content of philos.jsx
# Copy manifest.json and service-worker.js to public/
npm start
```

### Option 2: Vite (Recommended for speed)

```bash
npm create vite@latest philos-app -- --template react
cd philos-app
# Replace src/App.jsx with philos.jsx
# Copy manifest.json and service-worker.js to public/
npm install
npm run dev
```

### Option 3: Next.js

```bash
npx create-next-app@latest philos-app
cd philos-app
# Create pages/index.js and import the Philos component
npm run dev
```

## PWA Setup

1. Copy `manifest.json` to your `public/` folder
2. Copy `service-worker.js` to your `public/` folder
3. Add these lines to your `public/index.html` `<head>`:

```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#1a1a2e">
<meta name="apple-mobile-web-app-capable" content="yes">
```

4. Build and deploy your app
5. On mobile, use "Add to Home Screen" to install

## Controls

- **Scroll/Swipe** - Navigate between quotes
- **Arrow Keys** - Up/Down navigation (desktop)
- **Spacebar** - Next quote (desktop)
- **♡ Button** - Save quote to collection
- **↗ Button** - Share quote

## Customization

### Adding More Quotes

Add to the `allQuotes` array in `philos.jsx`:

```javascript
{ 
  text: "Your quote here.", 
  author: "Philosopher Name", 
  school: "School of Thought", 
  era: "Century" 
}
```

### Changing Colors

Edit the `getSchoolColor` function to customize the color scheme for each philosophical school.

### Adjusting Scroll Speed

Modify the sensitivity values in `handleWheel` and `handleTouchMove`:

```javascript
const sensitivity = 0.003; // Lower = slower scroll
```

## Tech Stack

- React 18+
- CSS-in-JS (inline styles)
- Local Storage API
- Web Share API
- Service Workers (PWA)
- Google Fonts (Cormorant Garamond, Jost)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile Safari (iOS 14+)
- Chrome for Android

## License

MIT - Feel free to use, modify, and distribute.

## Contributing

PRs welcome! Especially:
- More quotes from underrepresented philosophers
- Translations
- Accessibility improvements
- Performance optimizations

---

*"The unexamined life is not worth living."* — Socrates

const { useState, useEffect, useRef, useCallback, createContext, useContext } = React;

// ============================================================================
// QUOTE DATABASE - 400+ quotes with semantic categories
// ============================================================================

const allQuotes = [
  // STOICISM
  { text: "We suffer more often in imagination than in reality.", author: "Seneca", school: "Stoicism", era: "1st Century", themes: ["suffering", "wisdom"] },
  { text: "The soul becomes dyed with the color of its thoughts.", author: "Marcus Aurelius", school: "Stoicism", era: "2nd Century", themes: ["self", "wisdom"] },
  { text: "Waste no more time arguing about what a good man should be. Be one.", author: "Marcus Aurelius", school: "Stoicism", era: "2nd Century", themes: ["self", "courage"] },
  { text: "It is not death that a man should fear, but he should fear never beginning to live.", author: "Marcus Aurelius", school: "Stoicism", era: "2nd Century", themes: ["death", "meaning"] },
  { text: "The obstacle is the way.", author: "Marcus Aurelius", school: "Stoicism", era: "2nd Century", themes: ["courage", "change"] },
  { text: "You have power over your mind - not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius", school: "Stoicism", era: "2nd Century", themes: ["self", "freedom"] },
  { text: "The best revenge is not to be like your enemy.", author: "Marcus Aurelius", school: "Stoicism", era: "2nd Century", themes: ["wisdom", "self"] },
  { text: "When you arise in the morning, think of what a precious privilege it is to be alive.", author: "Marcus Aurelius", school: "Stoicism", era: "2nd Century", themes: ["joy", "meaning"] },
  { text: "Accept the things to which fate binds you, and love the people with whom fate brings you together.", author: "Marcus Aurelius", school: "Stoicism", era: "2nd Century", themes: ["love", "change"] },
  { text: "Never let the future disturb you. You will meet it with the same weapons of reason.", author: "Marcus Aurelius", school: "Stoicism", era: "2nd Century", themes: ["courage", "wisdom"] },
  { text: "The happiness of your life depends upon the quality of your thoughts.", author: "Marcus Aurelius", school: "Stoicism", era: "2nd Century", themes: ["joy", "self"] },
  { text: "Loss is nothing else but change, and change is Nature's delight.", author: "Marcus Aurelius", school: "Stoicism", era: "2nd Century", themes: ["change", "death"] },
  { text: "Begin at once to live, and count each separate day as a separate life.", author: "Seneca", school: "Stoicism", era: "1st Century", themes: ["meaning", "joy"] },
  { text: "It is not that we have a short time to live, but that we waste a lot of it.", author: "Seneca", school: "Stoicism", era: "1st Century", themes: ["meaning", "death"] },
  { text: "Luck is what happens when preparation meets opportunity.", author: "Seneca", school: "Stoicism", era: "1st Century", themes: ["wisdom", "courage"] },
  { text: "Difficulties strengthen the mind, as labor does the body.", author: "Seneca", school: "Stoicism", era: "1st Century", themes: ["suffering", "courage"] },
  { text: "He who is brave is free.", author: "Seneca", school: "Stoicism", era: "1st Century", themes: ["courage", "freedom"] },
  { text: "Every new beginning comes from some other beginning's end.", author: "Seneca", school: "Stoicism", era: "1st Century", themes: ["change", "meaning"] },
  { text: "There is nothing either good or bad, but thinking makes it so.", author: "Epictetus", school: "Stoicism", era: "2nd Century", themes: ["wisdom", "self"] },
  { text: "First say to yourself what you would be; and then do what you have to do.", author: "Epictetus", school: "Stoicism", era: "2nd Century", themes: ["self", "courage"] },
  { text: "It's not what happens to you, but how you react to it that matters.", author: "Epictetus", school: "Stoicism", era: "2nd Century", themes: ["wisdom", "freedom"] },
  { text: "No man is free who is not master of himself.", author: "Epictetus", school: "Stoicism", era: "2nd Century", themes: ["freedom", "self"] },
  { text: "Don't explain your philosophy. Embody it.", author: "Epictetus", school: "Stoicism", era: "2nd Century", themes: ["wisdom", "truth"] },

  // EXISTENTIALISM
  { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche", school: "Existentialism", era: "19th Century", themes: ["meaning", "suffering"] },
  { text: "Become who you are.", author: "Friedrich Nietzsche", school: "Existentialism", era: "19th Century", themes: ["self", "meaning"] },
  { text: "What does not kill me makes me stronger.", author: "Friedrich Nietzsche", school: "Existentialism", era: "19th Century", themes: ["suffering", "courage"] },
  { text: "To live is to suffer, to survive is to find some meaning in the suffering.", author: "Friedrich Nietzsche", school: "Existentialism", era: "19th Century", themes: ["suffering", "meaning"] },
  { text: "God is dead. God remains dead. And we have killed him.", author: "Friedrich Nietzsche", school: "Existentialism", era: "19th Century", themes: ["truth", "change"] },
  { text: "Amor fati – love your fate.", author: "Friedrich Nietzsche", school: "Existentialism", era: "19th Century", themes: ["love", "meaning"] },
  { text: "Without music, life would be a mistake.", author: "Friedrich Nietzsche", school: "Existentialism", era: "19th Century", themes: ["joy", "meaning"] },
  { text: "There are no facts, only interpretations.", author: "Friedrich Nietzsche", school: "Existentialism", era: "19th Century", themes: ["truth", "wisdom"] },
  { text: "He who fights with monsters should look to it that he himself does not become a monster.", author: "Friedrich Nietzsche", school: "Existentialism", era: "19th Century", themes: ["self", "wisdom"] },
  { text: "And if you gaze long enough into an abyss, the abyss will gaze back into you.", author: "Friedrich Nietzsche", school: "Existentialism", era: "19th Century", themes: ["self", "truth"] },
  { text: "The higher we soar, the smaller we appear to those who cannot fly.", author: "Friedrich Nietzsche", school: "Existentialism", era: "19th Century", themes: ["self", "courage"] },
  { text: "You must have chaos within you to give birth to a dancing star.", author: "Friedrich Nietzsche", school: "Existentialism", era: "19th Century", themes: ["change", "joy"] },
  { text: "Man is condemned to be free.", author: "Jean-Paul Sartre", school: "Existentialism", era: "20th Century", themes: ["freedom", "meaning"] },
  { text: "Hell is other people.", author: "Jean-Paul Sartre", school: "Existentialism", era: "20th Century", themes: ["love", "self"] },
  { text: "Freedom is what we do with what is done to us.", author: "Jean-Paul Sartre", school: "Existentialism", era: "20th Century", themes: ["freedom", "courage"] },
  { text: "Existence precedes essence.", author: "Jean-Paul Sartre", school: "Existentialism", era: "20th Century", themes: ["meaning", "self"] },
  { text: "We are our choices.", author: "Jean-Paul Sartre", school: "Existentialism", era: "20th Century", themes: ["self", "freedom"] },
  { text: "Everything has been figured out, except how to live.", author: "Jean-Paul Sartre", school: "Existentialism", era: "20th Century", themes: ["meaning", "wisdom"] },
  { text: "Life begins on the other side of despair.", author: "Jean-Paul Sartre", school: "Existentialism", era: "20th Century", themes: ["suffering", "meaning"] },
  { text: "If you are lonely when you're alone, you are in bad company.", author: "Jean-Paul Sartre", school: "Existentialism", era: "20th Century", themes: ["self", "love"] },
  { text: "Anxiety is the dizziness of freedom.", author: "Søren Kierkegaard", school: "Existentialism", era: "19th Century", themes: ["freedom", "suffering"] },
  { text: "Life must be understood backwards. But it must be lived forwards.", author: "Søren Kierkegaard", school: "Existentialism", era: "19th Century", themes: ["meaning", "wisdom"] },
  { text: "The most common form of despair is not being who you are.", author: "Søren Kierkegaard", school: "Existentialism", era: "19th Century", themes: ["self", "suffering"] },
  { text: "Between stimulus and response there is a space. In that space is our power to choose our response.", author: "Viktor Frankl", school: "Existentialism", era: "20th Century", themes: ["freedom", "wisdom"] },
  { text: "When we are no longer able to change a situation, we are challenged to change ourselves.", author: "Viktor Frankl", school: "Existentialism", era: "20th Century", themes: ["change", "courage"] },
  { text: "Everything can be taken from a man but one thing: the last of the human freedoms—to choose one's attitude.", author: "Viktor Frankl", school: "Existentialism", era: "20th Century", themes: ["freedom", "suffering"] },

  // ABSURDISM
  { text: "One must imagine Sisyphus happy.", author: "Albert Camus", school: "Absurdism", era: "20th Century", themes: ["meaning", "joy"] },
  { text: "In the depth of winter, I finally learned that within me there lay an invincible summer.", author: "Albert Camus", school: "Absurdism", era: "20th Century", themes: ["courage", "self"] },
  { text: "The only way to deal with an unfree world is to become so absolutely free that your very existence is an act of rebellion.", author: "Albert Camus", school: "Absurdism", era: "20th Century", themes: ["freedom", "courage"] },
  { text: "Live to the point of tears.", author: "Albert Camus", school: "Absurdism", era: "20th Century", themes: ["meaning", "joy"] },
  { text: "The struggle itself toward the heights is enough to fill a man's heart.", author: "Albert Camus", school: "Absurdism", era: "20th Century", themes: ["meaning", "courage"] },
  { text: "In the midst of hate, I found there was, within me, an invincible love.", author: "Albert Camus", school: "Absurdism", era: "20th Century", themes: ["love", "self"] },
  { text: "Real generosity towards the future lies in giving all to the present.", author: "Albert Camus", school: "Absurdism", era: "20th Century", themes: ["meaning", "wisdom"] },
  { text: "I rebel; therefore I exist.", author: "Albert Camus", school: "Absurdism", era: "20th Century", themes: ["freedom", "meaning"] },
  { text: "Blessed are the hearts that can bend; they shall never be broken.", author: "Albert Camus", school: "Absurdism", era: "20th Century", themes: ["love", "wisdom"] },

  // CLASSICAL GREEK
  { text: "The unexamined life is not worth living.", author: "Socrates", school: "Classical Greek", era: "5th Century BCE", themes: ["self", "meaning"] },
  { text: "The only true wisdom is in knowing you know nothing.", author: "Socrates", school: "Classical Greek", era: "5th Century BCE", themes: ["wisdom", "truth"] },
  { text: "To find yourself, think for yourself.", author: "Socrates", school: "Classical Greek", era: "5th Century BCE", themes: ["self", "freedom"] },
  { text: "Be kind, for everyone you meet is fighting a hard battle.", author: "Socrates", school: "Classical Greek", era: "5th Century BCE", themes: ["love", "suffering"] },
  { text: "Education is the kindling of a flame, not the filling of a vessel.", author: "Socrates", school: "Classical Greek", era: "5th Century BCE", themes: ["wisdom", "change"] },
  { text: "Wonder is the beginning of wisdom.", author: "Socrates", school: "Classical Greek", era: "5th Century BCE", themes: ["wisdom", "joy"] },
  { text: "The secret of change is to focus all of your energy not on fighting the old, but on building the new.", author: "Socrates", school: "Classical Greek", era: "5th Century BCE", themes: ["change", "courage"] },
  { text: "The greatest wealth is to live content with little.", author: "Plato", school: "Classical Greek", era: "4th Century BCE", themes: ["joy", "wisdom"] },
  { text: "Courage is knowing what not to fear.", author: "Plato", school: "Classical Greek", era: "4th Century BCE", themes: ["courage", "wisdom"] },
  { text: "The first and greatest victory is to conquer yourself.", author: "Plato", school: "Classical Greek", era: "4th Century BCE", themes: ["self", "courage"] },
  { text: "Music gives a soul to the universe, wings to the mind, flight to the imagination.", author: "Plato", school: "Classical Greek", era: "4th Century BCE", themes: ["joy", "meaning"] },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle", school: "Classical Greek", era: "4th Century BCE", themes: ["self", "wisdom"] },
  { text: "Happiness depends upon ourselves.", author: "Aristotle", school: "Classical Greek", era: "4th Century BCE", themes: ["joy", "self"] },
  { text: "Knowing yourself is the beginning of all wisdom.", author: "Aristotle", school: "Classical Greek", era: "4th Century BCE", themes: ["self", "wisdom"] },
  { text: "It is the mark of an educated mind to be able to entertain a thought without accepting it.", author: "Aristotle", school: "Classical Greek", era: "4th Century BCE", themes: ["wisdom", "truth"] },
  { text: "Patience is bitter, but its fruit is sweet.", author: "Aristotle", school: "Classical Greek", era: "4th Century BCE", themes: ["suffering", "wisdom"] },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle", school: "Classical Greek", era: "4th Century BCE", themes: ["self", "wisdom"] },

  // PRE-SOCRATIC
  { text: "One cannot step twice in the same river.", author: "Heraclitus", school: "Pre-Socratic", era: "6th Century BCE", themes: ["change", "truth"] },
  { text: "Everything flows.", author: "Heraclitus", school: "Pre-Socratic", era: "6th Century BCE", themes: ["change", "truth"] },
  { text: "Character is destiny.", author: "Heraclitus", school: "Pre-Socratic", era: "6th Century BCE", themes: ["self", "meaning"] },
  { text: "The only constant in life is change.", author: "Heraclitus", school: "Pre-Socratic", era: "6th Century BCE", themes: ["change", "truth"] },
  { text: "Day by day, what you choose, what you think and what you do is who you become.", author: "Heraclitus", school: "Pre-Socratic", era: "6th Century BCE", themes: ["self", "change"] },

  // BUDDHISM
  { text: "The way is not in the sky. The way is in the heart.", author: "Buddha", school: "Buddhism", era: "6th Century BCE", themes: ["self", "truth"] },
  { text: "The mind is everything. What you think you become.", author: "Buddha", school: "Buddhism", era: "6th Century BCE", themes: ["self", "wisdom"] },
  { text: "Peace comes from within. Do not seek it without.", author: "Buddha", school: "Buddhism", era: "6th Century BCE", themes: ["joy", "self"] },
  { text: "Three things cannot be long hidden: the sun, the moon, and the truth.", author: "Buddha", school: "Buddhism", era: "6th Century BCE", themes: ["truth", "wisdom"] },
  { text: "You yourself, as much as anybody in the entire universe, deserve your love and affection.", author: "Buddha", school: "Buddhism", era: "6th Century BCE", themes: ["love", "self"] },
  { text: "In the end, only three things matter: how much you loved, how gently you lived, and how gracefully you let go.", author: "Buddha", school: "Buddhism", era: "6th Century BCE", themes: ["love", "death"] },
  { text: "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.", author: "Buddha", school: "Buddhism", era: "6th Century BCE", themes: ["wisdom", "joy"] },
  { text: "Every morning we are born again. What we do today is what matters most.", author: "Buddha", school: "Buddhism", era: "6th Century BCE", themes: ["change", "meaning"] },
  { text: "Pain is certain, suffering is optional.", author: "Buddha", school: "Buddhism", era: "6th Century BCE", themes: ["suffering", "freedom"] },
  { text: "Holding on to anger is like grasping a hot coal with the intent of throwing it at someone else.", author: "Buddha", school: "Buddhism", era: "6th Century BCE", themes: ["suffering", "wisdom"] },
  { text: "No one saves us but ourselves. No one can and no one may. We ourselves must walk the path.", author: "Buddha", school: "Buddhism", era: "6th Century BCE", themes: ["self", "courage"] },
  { text: "The present moment is filled with joy and happiness. If you are attentive, you will see it.", author: "Thich Nhat Hanh", school: "Buddhism", era: "20th Century", themes: ["joy", "wisdom"] },
  { text: "Smile, breathe and go slowly.", author: "Thich Nhat Hanh", school: "Buddhism", era: "20th Century", themes: ["joy", "wisdom"] },
  { text: "Walk as if you are kissing the Earth with your feet.", author: "Thich Nhat Hanh", school: "Buddhism", era: "20th Century", themes: ["joy", "love"] },
  { text: "Because you are alive, everything is possible.", author: "Thich Nhat Hanh", school: "Buddhism", era: "20th Century", themes: ["meaning", "joy"] },
  { text: "Letting go gives us freedom, and freedom is the only condition for happiness.", author: "Thich Nhat Hanh", school: "Buddhism", era: "20th Century", themes: ["freedom", "joy"] },

  // ZEN BUDDHISM
  { text: "Before enlightenment, chop wood, carry water. After enlightenment, chop wood, carry water.", author: "Zen Proverb", school: "Zen Buddhism", era: "Traditional", themes: ["wisdom", "meaning"] },
  { text: "When you reach the top of the mountain, keep climbing.", author: "Zen Proverb", school: "Zen Buddhism", era: "Traditional", themes: ["courage", "meaning"] },
  { text: "The quieter you become, the more you can hear.", author: "Ram Dass", school: "Zen Buddhism", era: "20th Century", themes: ["wisdom", "self"] },
  { text: "Let go, or be dragged.", author: "Zen Proverb", school: "Zen Buddhism", era: "Traditional", themes: ["freedom", "change"] },
  { text: "Sitting quietly, doing nothing, spring comes, and the grass grows by itself.", author: "Matsuo Bashō", school: "Zen Buddhism", era: "17th Century", themes: ["wisdom", "change"] },
  { text: "When walking, walk. When eating, eat.", author: "Zen Proverb", school: "Zen Buddhism", era: "Traditional", themes: ["wisdom", "joy"] },
  { text: "The finger pointing at the moon is not the moon.", author: "Zen Proverb", school: "Zen Buddhism", era: "Traditional", themes: ["truth", "wisdom"] },
  { text: "To study the self is to forget the self. To forget the self is to be enlightened by all things.", author: "Dōgen", school: "Zen Buddhism", era: "13th Century", themes: ["self", "wisdom"] },

  // TAOISM
  { text: "The Tao that can be told is not the eternal Tao.", author: "Lao Tzu", school: "Taoism", era: "6th Century BCE", themes: ["truth", "wisdom"] },
  { text: "Knowing others is intelligence; knowing yourself is true wisdom.", author: "Lao Tzu", school: "Taoism", era: "6th Century BCE", themes: ["self", "wisdom"] },
  { text: "Nature does not hurry, yet everything is accomplished.", author: "Lao Tzu", school: "Taoism", era: "6th Century BCE", themes: ["wisdom", "change"] },
  { text: "When you realize nothing is lacking, the whole world belongs to you.", author: "Lao Tzu", school: "Taoism", era: "6th Century BCE", themes: ["joy", "wisdom"] },
  { text: "A journey of a thousand miles begins with a single step.", author: "Lao Tzu", school: "Taoism", era: "6th Century BCE", themes: ["courage", "change"] },
  { text: "Be content with what you have; rejoice in the way things are.", author: "Lao Tzu", school: "Taoism", era: "6th Century BCE", themes: ["joy", "wisdom"] },
  { text: "When I let go of what I am, I become what I might be.", author: "Lao Tzu", school: "Taoism", era: "6th Century BCE", themes: ["change", "self"] },
  { text: "Silence is a source of great strength.", author: "Lao Tzu", school: "Taoism", era: "6th Century BCE", themes: ["wisdom", "self"] },
  { text: "If you are depressed you are living in the past. If you are anxious you are living in the future. If you are at peace you are living in the present.", author: "Lao Tzu", school: "Taoism", era: "6th Century BCE", themes: ["joy", "wisdom"] },
  { text: "To the mind that is still, the whole universe surrenders.", author: "Lao Tzu", school: "Taoism", era: "6th Century BCE", themes: ["wisdom", "self"] },
  { text: "Life is a series of natural and spontaneous changes. Don't resist them; that only creates sorrow.", author: "Lao Tzu", school: "Taoism", era: "6th Century BCE", themes: ["change", "suffering"] },
  { text: "Care about what other people think and you will always be their prisoner.", author: "Lao Tzu", school: "Taoism", era: "6th Century BCE", themes: ["freedom", "self"] },
  { text: "Flow with whatever may happen and let your mind be free.", author: "Zhuangzi", school: "Taoism", era: "4th Century BCE", themes: ["freedom", "change"] },
  { text: "Happiness is the absence of the striving for happiness.", author: "Zhuangzi", school: "Taoism", era: "4th Century BCE", themes: ["joy", "wisdom"] },

  // SUFISM
  { text: "The wound is the place where the Light enters you.", author: "Rumi", school: "Sufism", era: "13th Century", themes: ["suffering", "love"] },
  { text: "Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.", author: "Rumi", school: "Sufism", era: "13th Century", themes: ["wisdom", "change"] },
  { text: "What you seek is seeking you.", author: "Rumi", school: "Sufism", era: "13th Century", themes: ["meaning", "love"] },
  { text: "Don't grieve. Anything you lose comes round in another form.", author: "Rumi", school: "Sufism", era: "13th Century", themes: ["death", "change"] },
  { text: "The garden of the world has no limits, except in your mind.", author: "Rumi", school: "Sufism", era: "13th Century", themes: ["freedom", "self"] },
  { text: "You are not a drop in the ocean. You are the entire ocean in a drop.", author: "Rumi", school: "Sufism", era: "13th Century", themes: ["self", "meaning"] },
  { text: "Raise your words, not your voice. It is rain that grows flowers, not thunder.", author: "Rumi", school: "Sufism", era: "13th Century", themes: ["wisdom", "love"] },
  { text: "Let yourself be silently drawn by the strange pull of what you really love.", author: "Rumi", school: "Sufism", era: "13th Century", themes: ["love", "meaning"] },
  { text: "Be like a tree and let the dead leaves drop.", author: "Rumi", school: "Sufism", era: "13th Century", themes: ["change", "freedom"] },
  { text: "Out beyond ideas of wrongdoing and rightdoing, there is a field. I'll meet you there.", author: "Rumi", school: "Sufism", era: "13th Century", themes: ["love", "truth"] },
  { text: "Stop acting so small. You are the universe in ecstatic motion.", author: "Rumi", school: "Sufism", era: "13th Century", themes: ["self", "joy"] },
  { text: "Silence is the language of God, all else is poor translation.", author: "Rumi", school: "Sufism", era: "13th Century", themes: ["truth", "wisdom"] },
  { text: "Set your life on fire. Seek those who fan your flames.", author: "Rumi", school: "Sufism", era: "13th Century", themes: ["love", "meaning"] },
  { text: "These pains you feel are messengers. Listen to them.", author: "Rumi", school: "Sufism", era: "13th Century", themes: ["suffering", "wisdom"] },
  { text: "Live life as if everything is rigged in your favor.", author: "Rumi", school: "Sufism", era: "13th Century", themes: ["joy", "courage"] },
  { text: "Why do you stay in prison when the door is so wide open?", author: "Rumi", school: "Sufism", era: "13th Century", themes: ["freedom", "change"] },
  { text: "I wish I could show you, when you are lonely or in darkness, the astonishing light of your own being.", author: "Hafiz", school: "Sufism", era: "14th Century", themes: ["self", "love"] },
  { text: "Fear is the cheapest room in the house. I would like to see you living in better conditions.", author: "Hafiz", school: "Sufism", era: "14th Century", themes: ["courage", "freedom"] },

  // EASTERN PHILOSOPHY
  { text: "The menu is not the meal.", author: "Alan Watts", school: "Eastern Philosophy", era: "20th Century", themes: ["truth", "wisdom"] },
  { text: "You are a function of what the whole universe is doing in the same way that a wave is a function of what the whole ocean is doing.", author: "Alan Watts", school: "Eastern Philosophy", era: "20th Century", themes: ["self", "meaning"] },
  { text: "The meaning of life is just to be alive. It is so plain and so obvious and so simple.", author: "Alan Watts", school: "Eastern Philosophy", era: "20th Century", themes: ["meaning", "joy"] },
  { text: "Muddy water is best cleared by leaving it alone.", author: "Alan Watts", school: "Eastern Philosophy", era: "20th Century", themes: ["wisdom", "change"] },
  { text: "This is the real secret of life — to be completely engaged with what you are doing in the here and now.", author: "Alan Watts", school: "Eastern Philosophy", era: "20th Century", themes: ["meaning", "joy"] },
  { text: "You are under no obligation to be the same person you were five minutes ago.", author: "Alan Watts", school: "Eastern Philosophy", era: "20th Century", themes: ["change", "freedom"] },
  { text: "The only way to make sense out of change is to plunge into it, move with it, and join the dance.", author: "Alan Watts", school: "Eastern Philosophy", era: "20th Century", themes: ["change", "joy"] },
  { text: "Trying to define yourself is like trying to bite your own teeth.", author: "Alan Watts", school: "Eastern Philosophy", era: "20th Century", themes: ["self", "wisdom"] },
  { text: "Man suffers only because he takes seriously what the gods made for fun.", author: "Alan Watts", school: "Eastern Philosophy", era: "20th Century", themes: ["suffering", "joy"] },

  // CONFUCIANISM
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius", school: "Confucianism", era: "6th Century BCE", themes: ["courage", "wisdom"] },
  { text: "Our greatest glory is not in never falling, but in rising every time we fall.", author: "Confucius", school: "Confucianism", era: "6th Century BCE", themes: ["courage", "change"] },
  { text: "Real knowledge is to know the extent of one's ignorance.", author: "Confucius", school: "Confucianism", era: "6th Century BCE", themes: ["wisdom", "truth"] },
  { text: "Everything has beauty, but not everyone sees it.", author: "Confucius", school: "Confucianism", era: "6th Century BCE", themes: ["truth", "joy"] },
  { text: "The man who moves a mountain begins by carrying away small stones.", author: "Confucius", school: "Confucianism", era: "6th Century BCE", themes: ["courage", "change"] },
  { text: "Wherever you go, go with all your heart.", author: "Confucius", school: "Confucianism", era: "6th Century BCE", themes: ["love", "meaning"] },
  { text: "By three methods we may learn wisdom: by reflection, which is noblest; by imitation, which is easiest; and by experience, which is the bitterest.", author: "Confucius", school: "Confucianism", era: "6th Century BCE", themes: ["wisdom", "suffering"] },

  // RATIONALISM
  { text: "I think, therefore I am.", author: "René Descartes", school: "Rationalism", era: "17th Century", themes: ["self", "truth"] },
  { text: "The reading of all good books is like a conversation with the finest minds of past centuries.", author: "René Descartes", school: "Rationalism", era: "17th Century", themes: ["wisdom", "joy"] },
  { text: "Doubt is the origin of wisdom.", author: "René Descartes", school: "Rationalism", era: "17th Century", themes: ["wisdom", "truth"] },

  // GERMAN IDEALISM
  { text: "Happiness is not an ideal of reason, but of imagination.", author: "Immanuel Kant", school: "German Idealism", era: "18th Century", themes: ["joy", "wisdom"] },
  { text: "Two things fill the mind with ever-increasing wonder and awe: the starry heavens above me and the moral law within me.", author: "Immanuel Kant", school: "German Idealism", era: "18th Century", themes: ["truth", "meaning"] },
  { text: "Science is organized knowledge. Wisdom is organized life.", author: "Immanuel Kant", school: "German Idealism", era: "18th Century", themes: ["wisdom", "truth"] },
  { text: "Have the courage to use your own understanding.", author: "Immanuel Kant", school: "German Idealism", era: "18th Century", themes: ["courage", "freedom"] },
  { text: "Rules for happiness: something to do, someone to love, something to hope for.", author: "Immanuel Kant", school: "German Idealism", era: "18th Century", themes: ["joy", "love"] },
  { text: "Nothing great in the world has ever been accomplished without passion.", author: "Georg Wilhelm Friedrich Hegel", school: "German Idealism", era: "19th Century", themes: ["courage", "meaning"] },

  // PESSIMISM
  { text: "Talent hits a target no one else can hit; genius hits a target no one else can see.", author: "Arthur Schopenhauer", school: "Pessimism", era: "19th Century", themes: ["wisdom", "self"] },
  { text: "Compassion is the basis of morality.", author: "Arthur Schopenhauer", school: "Pessimism", era: "19th Century", themes: ["love", "truth"] },
  { text: "A man can be himself only so long as he is alone.", author: "Arthur Schopenhauer", school: "Pessimism", era: "19th Century", themes: ["self", "freedom"] },
  { text: "We forfeit three-fourths of ourselves in order to be like other people.", author: "Arthur Schopenhauer", school: "Pessimism", era: "19th Century", themes: ["self", "freedom"] },
  { text: "Mostly it is loss which teaches us about the worth of things.", author: "Arthur Schopenhauer", school: "Pessimism", era: "19th Century", themes: ["death", "wisdom"] },

  // ANALYTIC PHILOSOPHY
  { text: "Whereof one cannot speak, thereof one must be silent.", author: "Ludwig Wittgenstein", school: "Analytic Philosophy", era: "20th Century", themes: ["truth", "wisdom"] },
  { text: "The limits of my language mean the limits of my world.", author: "Ludwig Wittgenstein", school: "Analytic Philosophy", era: "20th Century", themes: ["truth", "self"] },
  { text: "The good life is one inspired by love and guided by knowledge.", author: "Bertrand Russell", school: "Analytic Philosophy", era: "20th Century", themes: ["love", "wisdom"] },
  { text: "Do not fear to be eccentric in opinion, for every opinion now accepted was once eccentric.", author: "Bertrand Russell", school: "Analytic Philosophy", era: "20th Century", themes: ["courage", "truth"] },
  { text: "The fundamental cause of trouble in the world today is that the stupid are cocksure while the intelligent are full of doubt.", author: "Bertrand Russell", school: "Analytic Philosophy", era: "20th Century", themes: ["wisdom", "truth"] },
  { text: "I would never die for my beliefs because I might be wrong.", author: "Bertrand Russell", school: "Analytic Philosophy", era: "20th Century", themes: ["wisdom", "truth"] },

  // TRANSCENDENTALISM
  { text: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.", author: "Ralph Waldo Emerson", school: "Transcendentalism", era: "19th Century", themes: ["self", "courage"] },
  { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson", school: "Transcendentalism", era: "19th Century", themes: ["self", "courage"] },
  { text: "Do not go where the path may lead, go instead where there is no path and leave a trail.", author: "Ralph Waldo Emerson", school: "Transcendentalism", era: "19th Century", themes: ["courage", "freedom"] },
  { text: "For every minute you are angry you lose sixty seconds of happiness.", author: "Ralph Waldo Emerson", school: "Transcendentalism", era: "19th Century", themes: ["joy", "wisdom"] },
  { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson", school: "Transcendentalism", era: "19th Century", themes: ["self", "freedom"] },
  { text: "Life is a journey, not a destination.", author: "Ralph Waldo Emerson", school: "Transcendentalism", era: "19th Century", themes: ["meaning", "change"] },
  { text: "Finish each day and be done with it. You have done what you could.", author: "Ralph Waldo Emerson", school: "Transcendentalism", era: "19th Century", themes: ["wisdom", "joy"] },
  { text: "Go confidently in the direction of your dreams! Live the life you've imagined.", author: "Henry David Thoreau", school: "Transcendentalism", era: "19th Century", themes: ["courage", "meaning"] },
  { text: "It's not what you look at that matters, it's what you see.", author: "Henry David Thoreau", school: "Transcendentalism", era: "19th Century", themes: ["wisdom", "truth"] },
  { text: "The mass of men lead lives of quiet desperation.", author: "Henry David Thoreau", school: "Transcendentalism", era: "19th Century", themes: ["meaning", "suffering"] },
  { text: "Not until we are lost do we begin to understand ourselves.", author: "Henry David Thoreau", school: "Transcendentalism", era: "19th Century", themes: ["self", "change"] },
  { text: "I went to the woods because I wished to live deliberately.", author: "Henry David Thoreau", school: "Transcendentalism", era: "19th Century", themes: ["meaning", "freedom"] },

  // MYTHOLOGY & DEPTH PSYCHOLOGY
  { text: "The cave you fear to enter holds the treasure you seek.", author: "Joseph Campbell", school: "Mythology", era: "20th Century", themes: ["courage", "self"] },
  { text: "Follow your bliss and the universe will open doors where there were only walls.", author: "Joseph Campbell", school: "Mythology", era: "20th Century", themes: ["joy", "meaning"] },
  { text: "We must be willing to let go of the life we planned so as to have the life that is waiting for us.", author: "Joseph Campbell", school: "Mythology", era: "20th Century", themes: ["change", "freedom"] },
  { text: "The privilege of a lifetime is being who you are.", author: "Joseph Campbell", school: "Mythology", era: "20th Century", themes: ["self", "meaning"] },
  { text: "Find a place inside where there's joy, and the joy will burn out the pain.", author: "Joseph Campbell", school: "Mythology", era: "20th Century", themes: ["joy", "suffering"] },
  { text: "Until you make the unconscious conscious, it will direct your life and you will call it fate.", author: "Carl Jung", school: "Depth Psychology", era: "20th Century", themes: ["self", "truth"] },
  { text: "Who looks outside, dreams; who looks inside, awakes.", author: "Carl Jung", school: "Depth Psychology", era: "20th Century", themes: ["self", "wisdom"] },
  { text: "I am not what happened to me, I am what I choose to become.", author: "Carl Jung", school: "Depth Psychology", era: "20th Century", themes: ["self", "freedom"] },
  { text: "Everything that irritates us about others can lead us to an understanding of ourselves.", author: "Carl Jung", school: "Depth Psychology", era: "20th Century", themes: ["self", "wisdom"] },
  { text: "Your visions will become clear only when you can look into your own heart.", author: "Carl Jung", school: "Depth Psychology", era: "20th Century", themes: ["self", "truth"] },
  { text: "Knowing your own darkness is the best method for dealing with the darknesses of other people.", author: "Carl Jung", school: "Depth Psychology", era: "20th Century", themes: ["self", "wisdom"] },
  { text: "No tree can grow to Heaven unless its roots reach down to Hell.", author: "Carl Jung", school: "Depth Psychology", era: "20th Century", themes: ["truth", "self"] },

  // POLITICAL PHILOSOPHY
  { text: "Injustice anywhere is a threat to justice everywhere.", author: "Martin Luther King Jr.", school: "Political Philosophy", era: "20th Century", themes: ["truth", "love"] },
  { text: "Darkness cannot drive out darkness; only light can do that.", author: "Martin Luther King Jr.", school: "Political Philosophy", era: "20th Century", themes: ["love", "courage"] },
  { text: "I have decided to stick with love. Hate is too great a burden to bear.", author: "Martin Luther King Jr.", school: "Political Philosophy", era: "20th Century", themes: ["love", "freedom"] },

  // RENAISSANCE
  { text: "The most certain sign of wisdom is cheerfulness.", author: "Michel de Montaigne", school: "Renaissance", era: "16th Century", themes: ["joy", "wisdom"] },
  { text: "There is no conversation more boring than the one where everybody agrees.", author: "Michel de Montaigne", school: "Renaissance", era: "16th Century", themes: ["truth", "wisdom"] },
  { text: "My life has been full of terrible misfortunes most of which never happened.", author: "Michel de Montaigne", school: "Renaissance", era: "16th Century", themes: ["suffering", "wisdom"] },

  // ============================================================================
  // NEW TRADITIONS
  // ============================================================================

  // AFRICAN PHILOSOPHY (UBUNTU)
  { text: "I am because we are.", author: "Ubuntu Philosophy", school: "African Philosophy", era: "Traditional", themes: ["love", "meaning"] },
  { text: "If you want to go fast, go alone. If you want to go far, go together.", author: "African Proverb", school: "African Philosophy", era: "Traditional", themes: ["love", "wisdom"] },
  { text: "Ubuntu speaks about humaneness, gentleness, hospitality, putting yourself out on behalf of others, being vulnerable.", author: "Desmond Tutu", school: "African Philosophy", era: "20th Century", themes: ["love", "self"] },
  { text: "My humanity is bound up in yours, for we can only be human together.", author: "Desmond Tutu", school: "African Philosophy", era: "20th Century", themes: ["love", "truth"] },
  { text: "Do your little bit of good where you are; it's those little bits of good put together that overwhelm the world.", author: "Desmond Tutu", school: "African Philosophy", era: "20th Century", themes: ["courage", "love"] },
  { text: "Hope is being able to see that there is light despite all of the darkness.", author: "Desmond Tutu", school: "African Philosophy", era: "20th Century", themes: ["courage", "suffering"] },
  { text: "If you are neutral in situations of injustice, you have chosen the side of the oppressor.", author: "Desmond Tutu", school: "African Philosophy", era: "20th Century", themes: ["truth", "courage"] },
  { text: "A person with ubuntu is open and available to others, affirming of others.", author: "Desmond Tutu", school: "African Philosophy", era: "20th Century", themes: ["love", "self"] },
  { text: "Resentment and anger are bad for your blood pressure and your digestion.", author: "Desmond Tutu", school: "African Philosophy", era: "20th Century", themes: ["wisdom", "joy"] },
  { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela", school: "African Philosophy", era: "20th Century", themes: ["courage", "change"] },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela", school: "African Philosophy", era: "20th Century", themes: ["courage", "meaning"] },
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela", school: "African Philosophy", era: "20th Century", themes: ["wisdom", "change"] },
  { text: "I learned that courage was not the absence of fear, but the triumph over it.", author: "Nelson Mandela", school: "African Philosophy", era: "20th Century", themes: ["courage", "self"] },
  { text: "There is no passion to be found playing small—in settling for a life that is less than the one you are capable of living.", author: "Nelson Mandela", school: "African Philosophy", era: "20th Century", themes: ["meaning", "courage"] },
  { text: "A blind person who has relatives can see.", author: "African Proverb", school: "African Philosophy", era: "Traditional", themes: ["love", "wisdom"] },
  { text: "When there is no enemy within, the enemies outside cannot hurt you.", author: "African Proverb", school: "African Philosophy", era: "Traditional", themes: ["self", "courage"] },
  { text: "However long the night, the dawn will break.", author: "African Proverb", school: "African Philosophy", era: "Traditional", themes: ["courage", "suffering"] },
  { text: "Smooth seas do not make skillful sailors.", author: "African Proverb", school: "African Philosophy", era: "Traditional", themes: ["suffering", "wisdom"] },

  // NATIVE AMERICAN WISDOM
  { text: "Seek wisdom, not knowledge. Knowledge is of the past; Wisdom is of the future.", author: "Lumbee Proverb", school: "Native American", era: "Traditional", themes: ["wisdom", "truth"] },
  { text: "Our first teacher is our own heart.", author: "Cheyenne Proverb", school: "Native American", era: "Traditional", themes: ["self", "wisdom"] },
  { text: "In our every deliberation, we must consider the impact of our decisions on the next seven generations.", author: "Iroquois Proverb", school: "Native American", era: "Traditional", themes: ["wisdom", "love"] },
  { text: "It is better to have less thunder in the mouth and more lightning in the hand.", author: "Apache Proverb", school: "Native American", era: "Traditional", themes: ["courage", "truth"] },
  { text: "When you were born, you cried and the world rejoiced. Live your life so that when you die, the world cries and you rejoice.", author: "Cherokee Proverb", school: "Native American", era: "Traditional", themes: ["meaning", "death"] },
  { text: "Don't let yesterday use up too much of today.", author: "Cherokee Proverb", school: "Native American", era: "Traditional", themes: ["wisdom", "change"] },
  { text: "When you arise in the morning give thanks for the food and for the joy of living.", author: "Tecumseh", school: "Native American", era: "19th Century", themes: ["joy", "meaning"] },
  { text: "It does not take many words to tell the truth.", author: "Chief Joseph", school: "Native American", era: "19th Century", themes: ["truth", "wisdom"] },
  { text: "Listen, or your tongue will make you deaf.", author: "Native American Proverb", school: "Native American", era: "Traditional", themes: ["wisdom", "truth"] },
  { text: "To touch the Earth is to have harmony with nature.", author: "Oglala Sioux Proverb", school: "Native American", era: "Traditional", themes: ["joy", "truth"] },
  { text: "Take only what you need and leave the land as you found it.", author: "Arapaho Proverb", school: "Native American", era: "Traditional", themes: ["wisdom", "love"] },
  { text: "We do not inherit the earth from our ancestors; we borrow it from our children.", author: "Native American Proverb", school: "Native American", era: "Traditional", themes: ["truth", "love"] },
  { text: "All things are connected like the blood that unites us. We did not weave the web of life, we are merely a strand in it.", author: "Chief Seattle", school: "Native American", era: "19th Century", themes: ["truth", "love"] },
  { text: "Wisdom comes only when you stop looking for it and start living the life the Creator intended for you.", author: "Hopi Proverb", school: "Native American", era: "Traditional", themes: ["wisdom", "meaning"] },

  // FEMINIST PHILOSOPHY
  { text: "One is not born, but rather becomes, a woman.", author: "Simone de Beauvoir", school: "Feminist Philosophy", era: "20th Century", themes: ["self", "freedom"] },
  { text: "The point is not for women simply to take power out of men's hands, since that wouldn't change anything about the world. It's a question precisely of destroying that notion of power.", author: "Simone de Beauvoir", school: "Feminist Philosophy", era: "20th Century", themes: ["freedom", "change"] },
  { text: "I wish that every human life might be pure transparent freedom.", author: "Simone de Beauvoir", school: "Feminist Philosophy", era: "20th Century", themes: ["freedom", "meaning"] },
  { text: "Change your life today. Don't gamble on the future, act now, without delay.", author: "Simone de Beauvoir", school: "Feminist Philosophy", era: "20th Century", themes: ["courage", "change"] },
  { text: "Authentic love must be founded on reciprocal recognition of two freedoms.", author: "Simone de Beauvoir", school: "Feminist Philosophy", era: "20th Century", themes: ["love", "freedom"] },
  { text: "The sad truth is that most evil is done by people who never make up their minds to be good or evil.", author: "Hannah Arendt", school: "Feminist Philosophy", era: "20th Century", themes: ["truth", "self"] },
  { text: "Forgiveness is the key to action and freedom.", author: "Hannah Arendt", school: "Feminist Philosophy", era: "20th Century", themes: ["freedom", "love"] },
  { text: "The most radical revolutionary will become a conservative the day after the revolution.", author: "Hannah Arendt", school: "Feminist Philosophy", era: "20th Century", themes: ["change", "truth"] },
  { text: "Storytelling reveals meaning without committing the error of defining it.", author: "Hannah Arendt", school: "Feminist Philosophy", era: "20th Century", themes: ["truth", "meaning"] },
  { text: "Love is an act of endless forgiveness, a tender look which becomes a habit.", author: "bell hooks", school: "Feminist Philosophy", era: "20th Century", themes: ["love", "change"] },
  { text: "Knowing how to be solitary is central to the art of loving.", author: "bell hooks", school: "Feminist Philosophy", era: "20th Century", themes: ["love", "self"] },
  { text: "Life-transforming ideas have always come to me through books.", author: "bell hooks", school: "Feminist Philosophy", era: "20th Century", themes: ["wisdom", "change"] },
  { text: "What we do is more important than what we say or what we say we believe.", author: "bell hooks", school: "Feminist Philosophy", era: "20th Century", themes: ["truth", "courage"] },

  // INDIAN PHILOSOPHY (VEDANTA)
  { text: "You have the right to work, but for the work's sake only. You have no right to the fruits of work.", author: "Bhagavad Gita", school: "Vedanta", era: "Ancient", themes: ["wisdom", "freedom"] },
  { text: "You are what you believe in. You become that which you believe you can become.", author: "Bhagavad Gita", school: "Vedanta", era: "Ancient", themes: ["self", "change"] },
  { text: "Death is as sure for that which is born, as birth is for that which is dead. Therefore grieve not for what is inevitable.", author: "Bhagavad Gita", school: "Vedanta", era: "Ancient", themes: ["death", "wisdom"] },
  { text: "The infinite is bliss. There is no bliss in anything finite.", author: "Upanishads", school: "Vedanta", era: "Ancient", themes: ["joy", "truth"] },
  { text: "The Self is one. Unmoving, it moves swifter than thought.", author: "Upanishads", school: "Vedanta", era: "Ancient", themes: ["self", "truth"] },
  { text: "From the unreal lead me to the real. From darkness lead me to light. From death lead me to immortality.", author: "Upanishads", school: "Vedanta", era: "Ancient", themes: ["truth", "meaning"] },
  { text: "Arise, awake, and stop not till the goal is reached.", author: "Swami Vivekananda", school: "Vedanta", era: "19th Century", themes: ["courage", "meaning"] },
  { text: "In a conflict between the heart and the brain, follow your heart.", author: "Swami Vivekananda", school: "Vedanta", era: "19th Century", themes: ["self", "courage"] },
  { text: "All the powers in the universe are already ours. It is we who have put our hands before our eyes and cry that it is dark.", author: "Swami Vivekananda", school: "Vedanta", era: "19th Century", themes: ["self", "truth"] },
  { text: "Your own Self-Realization is the greatest service you can render the world.", author: "Ramana Maharshi", school: "Vedanta", era: "20th Century", themes: ["self", "love"] },
  { text: "Happiness is your nature. It is not wrong to desire it. What is wrong is seeking it outside when it is inside.", author: "Ramana Maharshi", school: "Vedanta", era: "20th Century", themes: ["joy", "self"] },
  { text: "Your duty is to be; not to be this or that.", author: "Ramana Maharshi", school: "Vedanta", era: "20th Century", themes: ["self", "freedom"] },
  { text: "The mind turned outwards results in thoughts and objects. Turned inwards, it becomes the Self.", author: "Ramana Maharshi", school: "Vedanta", era: "20th Century", themes: ["self", "truth"] },
  { text: "You and I are all as much continuous with the physical universe as a wave is continuous with the ocean.", author: "Sri Aurobindo", school: "Vedanta", era: "20th Century", themes: ["truth", "self"] },
  { text: "All life is yoga.", author: "Sri Aurobindo", school: "Vedanta", era: "20th Century", themes: ["meaning", "self"] },

  // ============================================================================
  // MEDIEVAL PHILOSOPHY
  // ============================================================================
  { text: "Our hearts are restless until they find their rest in you.", author: "St. Augustine", school: "Medieval Philosophy", era: "5th Century", themes: ["meaning", "self"] },
  { text: "Love, and do what you will.", author: "St. Augustine", school: "Medieval Philosophy", era: "5th Century", themes: ["love", "freedom"] },
  { text: "Faith is to believe what you do not see; the reward of this faith is to see what you believe.", author: "St. Augustine", school: "Medieval Philosophy", era: "5th Century", themes: ["truth", "courage"] },
  { text: "The world is a book and those who do not travel read only one page.", author: "St. Augustine", school: "Medieval Philosophy", era: "5th Century", themes: ["wisdom", "meaning"] },
  { text: "There is no saint without a past, no sinner without a future.", author: "St. Augustine", school: "Medieval Philosophy", era: "5th Century", themes: ["change", "self"] },
  { text: "To one who has faith, no explanation is necessary. To one without faith, no explanation is possible.", author: "Thomas Aquinas", school: "Medieval Philosophy", era: "13th Century", themes: ["truth", "wisdom"] },
  { text: "There is nothing on this earth more to be prized than true friendship.", author: "Thomas Aquinas", school: "Medieval Philosophy", era: "13th Century", themes: ["love", "meaning"] },
  { text: "The things that we love tell us what we are.", author: "Thomas Aquinas", school: "Medieval Philosophy", era: "13th Century", themes: ["love", "self"] },
  { text: "Wonder is the desire for knowledge.", author: "Thomas Aquinas", school: "Medieval Philosophy", era: "13th Century", themes: ["wisdom", "joy"] },
  { text: "If the highest aim of a captain were to preserve his ship, he would keep it in port forever.", author: "Thomas Aquinas", school: "Medieval Philosophy", era: "13th Century", themes: ["courage", "meaning"] },

  // ISLAMIC PHILOSOPHY
  { text: "The ink of the scholar is more sacred than the blood of the martyr.", author: "Prophet Muhammad", school: "Islamic Philosophy", era: "7th Century", themes: ["wisdom", "truth"] },
  { text: "He who knows himself knows his Lord.", author: "Prophet Muhammad", school: "Islamic Philosophy", era: "7th Century", themes: ["self", "truth"] },
  { text: "The cure for ignorance is to question.", author: "Prophet Muhammad", school: "Islamic Philosophy", era: "7th Century", themes: ["wisdom", "truth"] },
  { text: "The soul is a stranger in this world.", author: "Ibn Arabi", school: "Islamic Philosophy", era: "13th Century", themes: ["self", "truth"] },
  { text: "When my heart became capable of every form, I knew love had arrived.", author: "Ibn Arabi", school: "Islamic Philosophy", era: "13th Century", themes: ["love", "change"] },
  { text: "Half of disbelief in God is believing in bad luck.", author: "Al-Ghazali", school: "Islamic Philosophy", era: "12th Century", themes: ["courage", "truth"] },
  { text: "Knowledge without action is wastefulness and action without knowledge is foolishness.", author: "Al-Ghazali", school: "Islamic Philosophy", era: "12th Century", themes: ["wisdom", "truth"] },
  { text: "The happiness of the drop is to die in the river.", author: "Al-Ghazali", school: "Islamic Philosophy", era: "12th Century", themes: ["death", "joy"] },
  { text: "There is no human being who is not subject to passions. The way of the sage is to moderate them.", author: "Ibn Sina", school: "Islamic Philosophy", era: "11th Century", themes: ["wisdom", "self"] },

  // SPINOZA & RATIONALIST EXPANSION
  { text: "Peace is not an absence of war, it is a virtue, a state of mind, a disposition for benevolence.", author: "Baruch Spinoza", school: "Rationalism", era: "17th Century", themes: ["joy", "wisdom"] },
  { text: "Be not astonished at new ideas; for it is well known to you that a thing does not therefore cease to be true because it is not accepted by many.", author: "Baruch Spinoza", school: "Rationalism", era: "17th Century", themes: ["truth", "courage"] },
  { text: "I have striven not to laugh at human actions, not to weep at them, nor to hate them, but to understand them.", author: "Baruch Spinoza", school: "Rationalism", era: "17th Century", themes: ["wisdom", "love"] },
  { text: "The highest activity a human being can attain is learning for understanding, because to understand is to be free.", author: "Baruch Spinoza", school: "Rationalism", era: "17th Century", themes: ["freedom", "wisdom"] },
  { text: "Emotion, which is suffering, ceases to be suffering as soon as we form a clear and precise picture of it.", author: "Baruch Spinoza", school: "Rationalism", era: "17th Century", themes: ["suffering", "wisdom"] },
  { text: "Pride is pleasure arising from a man's thinking too highly of himself.", author: "Baruch Spinoza", school: "Rationalism", era: "17th Century", themes: ["self", "wisdom"] },
  { text: "To love is to find pleasure in the happiness of another.", author: "Gottfried Wilhelm Leibniz", school: "Rationalism", era: "17th Century", themes: ["love", "joy"] },

  // PRAGMATISM
  { text: "Act as if what you do makes a difference. It does.", author: "William James", school: "Pragmatism", era: "19th Century", themes: ["meaning", "courage"] },
  { text: "The greatest use of a life is to spend it on something that will outlast it.", author: "William James", school: "Pragmatism", era: "19th Century", themes: ["meaning", "death"] },
  { text: "The art of being wise is knowing what to overlook.", author: "William James", school: "Pragmatism", era: "19th Century", themes: ["wisdom", "self"] },
  { text: "We are like islands in the sea, separate on the surface but connected in the deep.", author: "William James", school: "Pragmatism", era: "19th Century", themes: ["love", "truth"] },
  { text: "Believe that life is worth living and your belief will help create the fact.", author: "William James", school: "Pragmatism", era: "19th Century", themes: ["meaning", "courage"] },
  { text: "The greatest weapon against stress is our ability to choose one thought over another.", author: "William James", school: "Pragmatism", era: "19th Century", themes: ["freedom", "self"] },
  { text: "A great many people think they are thinking when they are merely rearranging their prejudices.", author: "William James", school: "Pragmatism", era: "19th Century", themes: ["wisdom", "truth"] },
  { text: "Education is not preparation for life; education is life itself.", author: "John Dewey", school: "Pragmatism", era: "20th Century", themes: ["wisdom", "meaning"] },
  { text: "We do not learn from experience... we learn from reflecting on experience.", author: "John Dewey", school: "Pragmatism", era: "20th Century", themes: ["wisdom", "self"] },
  { text: "The self is not something ready-made, but something in continuous formation through choice of action.", author: "John Dewey", school: "Pragmatism", era: "20th Century", themes: ["self", "change"] },
  { text: "Failure is instructive. The person who really thinks learns quite as much from failures as from successes.", author: "John Dewey", school: "Pragmatism", era: "20th Century", themes: ["wisdom", "courage"] },

  // PHENOMENOLOGY & CONTINENTAL
  { text: "Tell me how you read and I will tell you who you are.", author: "Martin Heidegger", school: "Phenomenology", era: "20th Century", themes: ["self", "truth"] },
  { text: "The most thought-provoking thing in our thought-provoking time is that we are still not thinking.", author: "Martin Heidegger", school: "Phenomenology", era: "20th Century", themes: ["wisdom", "truth"] },
  { text: "Language is the house of Being.", author: "Martin Heidegger", school: "Phenomenology", era: "20th Century", themes: ["truth", "self"] },
  { text: "Every man is born as many men and dies as a single one.", author: "Martin Heidegger", school: "Phenomenology", era: "20th Century", themes: ["death", "self"] },
  { text: "To perceive is to render oneself present to something through the body.", author: "Maurice Merleau-Ponty", school: "Phenomenology", era: "20th Century", themes: ["self", "truth"] },
  { text: "The body is our general medium for having a world.", author: "Maurice Merleau-Ponty", school: "Phenomenology", era: "20th Century", themes: ["self", "truth"] },
  { text: "People know what they do; frequently they know why they do what they do; but what they don't know is what what they do does.", author: "Michel Foucault", school: "Post-Structuralism", era: "20th Century", themes: ["self", "truth"] },
  { text: "Where there is power, there is resistance.", author: "Michel Foucault", school: "Post-Structuralism", era: "20th Century", themes: ["freedom", "courage"] },
  { text: "I don't feel that it is necessary to know exactly what I am. The main interest in life and work is to become someone else that you were not in the beginning.", author: "Michel Foucault", school: "Post-Structuralism", era: "20th Century", themes: ["self", "change"] },

  // KRISHNAMURTI
  { text: "It is no measure of health to be well adjusted to a profoundly sick society.", author: "Jiddu Krishnamurti", school: "Eastern Philosophy", era: "20th Century", themes: ["truth", "self"] },
  { text: "The ability to observe without evaluating is the highest form of intelligence.", author: "Jiddu Krishnamurti", school: "Eastern Philosophy", era: "20th Century", themes: ["wisdom", "self"] },
  { text: "The more you know yourself, the more clarity there is.", author: "Jiddu Krishnamurti", school: "Eastern Philosophy", era: "20th Century", themes: ["self", "truth"] },
  { text: "Freedom from the desire for an answer is essential to the understanding of a problem.", author: "Jiddu Krishnamurti", school: "Eastern Philosophy", era: "20th Century", themes: ["freedom", "wisdom"] },
  { text: "In obedience there is always fear, and fear darkens the mind.", author: "Jiddu Krishnamurti", school: "Eastern Philosophy", era: "20th Century", themes: ["freedom", "courage"] },
  { text: "Truth is a pathless land.", author: "Jiddu Krishnamurti", school: "Eastern Philosophy", era: "20th Century", themes: ["truth", "freedom"] },
  { text: "You can only be afraid of what you think you know.", author: "Jiddu Krishnamurti", school: "Eastern Philosophy", era: "20th Century", themes: ["courage", "wisdom"] },

  // MORE ZEN / JAPANESE
  { text: "The temple bell stops but I still hear the sound coming out of the flowers.", author: "Matsuo Bashō", school: "Zen Buddhism", era: "17th Century", themes: ["joy", "wisdom"] },
  { text: "Do not seek to follow in the footsteps of the wise. Seek what they sought.", author: "Matsuo Bashō", school: "Zen Buddhism", era: "17th Century", themes: ["wisdom", "self"] },
  { text: "Every day is a journey, and the journey itself is home.", author: "Matsuo Bashō", school: "Zen Buddhism", era: "17th Century", themes: ["meaning", "joy"] },
  { text: "If you want to know the past, look at your present. If you want to know the future, look at your present.", author: "Suzuki Roshi", school: "Zen Buddhism", era: "20th Century", themes: ["wisdom", "truth"] },
  { text: "In the beginner's mind there are many possibilities, but in the expert's there are few.", author: "Suzuki Roshi", school: "Zen Buddhism", era: "20th Century", themes: ["wisdom", "self"] },
  { text: "When you do something, you should burn yourself completely, like a good bonfire, leaving no trace of yourself.", author: "Suzuki Roshi", school: "Zen Buddhism", era: "20th Century", themes: ["self", "meaning"] },
  { text: "Treat every moment as your last. It is not preparation for something else.", author: "Suzuki Roshi", school: "Zen Buddhism", era: "20th Century", themes: ["meaning", "death"] },

  // MORE SENECA & ROMAN
  { text: "While we are postponing, life speeds by.", author: "Seneca", school: "Stoicism", era: "1st Century", themes: ["meaning", "death"] },
  { text: "A gem cannot be polished without friction, nor a man perfected without trials.", author: "Seneca", school: "Stoicism", era: "1st Century", themes: ["suffering", "self"] },
  { text: "If a man knows not to which port he sails, no wind is favorable.", author: "Seneca", school: "Stoicism", era: "1st Century", themes: ["meaning", "wisdom"] },
  { text: "It is not because things are difficult that we do not dare; it is because we do not dare that they are difficult.", author: "Seneca", school: "Stoicism", era: "1st Century", themes: ["courage", "truth"] },
  { text: "The whole future lies in uncertainty: live immediately.", author: "Seneca", school: "Stoicism", era: "1st Century", themes: ["meaning", "courage"] },
  { text: "Sometimes even to live is an act of courage.", author: "Seneca", school: "Stoicism", era: "1st Century", themes: ["courage", "suffering"] },
  { text: "Life is long if you know how to use it.", author: "Seneca", school: "Stoicism", era: "1st Century", themes: ["meaning", "wisdom"] },
  { text: "We are always complaining that our days are few, and acting as though there would be no end of them.", author: "Seneca", school: "Stoicism", era: "1st Century", themes: ["death", "wisdom"] },
  { text: "The authority of those who teach is often an obstacle to those who want to learn.", author: "Cicero", school: "Stoicism", era: "1st Century BCE", themes: ["wisdom", "freedom"] },
  { text: "A room without books is like a body without a soul.", author: "Cicero", school: "Stoicism", era: "1st Century BCE", themes: ["wisdom", "joy"] },
  { text: "Gratitude is not only the greatest of virtues, but the parent of all others.", author: "Cicero", school: "Stoicism", era: "1st Century BCE", themes: ["joy", "love"] },

  // MORE CHINESE PHILOSOPHY
  { text: "Those who know do not speak. Those who speak do not know.", author: "Lao Tzu", school: "Taoism", era: "6th Century BCE", themes: ["wisdom", "truth"] },
  { text: "Great acts are made up of small deeds.", author: "Lao Tzu", school: "Taoism", era: "6th Century BCE", themes: ["courage", "meaning"] },
  { text: "He who conquers others is strong; he who conquers himself is mighty.", author: "Lao Tzu", school: "Taoism", era: "6th Century BCE", themes: ["self", "courage"] },
  { text: "The softest things in the world overcome the hardest things in the world.", author: "Lao Tzu", school: "Taoism", era: "6th Century BCE", themes: ["wisdom", "courage"] },
  { text: "The master of the art of living makes little distinction between his work and his play.", author: "Lao Tzu", school: "Taoism", era: "6th Century BCE", themes: ["joy", "meaning"] },
  { text: "If you look to others for fulfillment, you will never be fulfilled.", author: "Lao Tzu", school: "Taoism", era: "6th Century BCE", themes: ["self", "joy"] },
  { text: "A wise man, recognizing that the world is but an illusion, does not act as if it is real.", author: "Zhuangzi", school: "Taoism", era: "4th Century BCE", themes: ["wisdom", "truth"] },
  { text: "The fish trap exists because of the fish. Once you've gotten the fish you can forget the trap.", author: "Zhuangzi", school: "Taoism", era: "4th Century BCE", themes: ["wisdom", "freedom"] },
  { text: "I do not know whether I was then a man dreaming I was a butterfly, or whether I am now a butterfly dreaming I am a man.", author: "Zhuangzi", school: "Taoism", era: "4th Century BCE", themes: ["truth", "self"] },
  { text: "Treat those who are good with goodness, and also treat those who are not good with goodness.", author: "Mencius", school: "Confucianism", era: "4th Century BCE", themes: ["love", "wisdom"] },
  { text: "The great man is he who does not lose his child's heart.", author: "Mencius", school: "Confucianism", era: "4th Century BCE", themes: ["self", "joy"] },

  // DOSTOEVSKY & RUSSIAN
  { text: "Hell is the suffering of being unable to love.", author: "Fyodor Dostoevsky", school: "Existentialism", era: "19th Century", themes: ["love", "suffering"] },
  { text: "The soul is healed by being with children.", author: "Fyodor Dostoevsky", school: "Existentialism", era: "19th Century", themes: ["love", "joy"] },
  { text: "Pain and suffering are always inevitable for a large intelligence and a deep heart.", author: "Fyodor Dostoevsky", school: "Existentialism", era: "19th Century", themes: ["suffering", "wisdom"] },
  { text: "Beauty will save the world.", author: "Fyodor Dostoevsky", school: "Existentialism", era: "19th Century", themes: ["truth", "meaning"] },
  { text: "The mystery of human existence lies not in just staying alive, but in finding something to live for.", author: "Fyodor Dostoevsky", school: "Existentialism", era: "19th Century", themes: ["meaning", "self"] },
  { text: "To love someone means to see them as God intended them.", author: "Fyodor Dostoevsky", school: "Existentialism", era: "19th Century", themes: ["love", "truth"] },

  // PASCAL & FRENCH
  { text: "The heart has its reasons which reason knows nothing of.", author: "Blaise Pascal", school: "Rationalism", era: "17th Century", themes: ["love", "truth"] },
  { text: "All of humanity's problems stem from man's inability to sit quietly in a room alone.", author: "Blaise Pascal", school: "Rationalism", era: "17th Century", themes: ["self", "wisdom"] },
  { text: "We are more often frightened than hurt; and we suffer more from imagination than from reality.", author: "Blaise Pascal", school: "Rationalism", era: "17th Century", themes: ["suffering", "courage"] },
  { text: "Man is but a reed, the most feeble thing in nature; but he is a thinking reed.", author: "Blaise Pascal", school: "Rationalism", era: "17th Century", themes: ["self", "wisdom"] },
  { text: "Kind words do not cost much. Yet they accomplish much.", author: "Blaise Pascal", school: "Rationalism", era: "17th Century", themes: ["love", "wisdom"] },

  // MORE EXISTENTIALISM
  { text: "The privilege of a lifetime is to become who you truly are.", author: "Carl Jung", school: "Depth Psychology", era: "20th Century", themes: ["self", "meaning"] },
  { text: "Where love rules, there is no will to power; and where power predominates, there love is lacking.", author: "Carl Jung", school: "Depth Psychology", era: "20th Century", themes: ["love", "truth"] },
  { text: "The shoe that fits one person pinches another; there is no recipe for living that suits all cases.", author: "Carl Jung", school: "Depth Psychology", era: "20th Century", themes: ["self", "freedom"] },
  { text: "The meeting of two personalities is like the contact of two chemical substances: if there is any reaction, both are transformed.", author: "Carl Jung", school: "Depth Psychology", era: "20th Century", themes: ["love", "change"] },

  // ANCIENT WISDOM
  { text: "Know thyself.", author: "Oracle of Delphi", school: "Classical Greek", era: "Ancient", themes: ["self", "wisdom"] },
  { text: "Nothing in excess.", author: "Oracle of Delphi", school: "Classical Greek", era: "Ancient", themes: ["wisdom", "self"] },
  { text: "Man know thyself; then thou shalt know the Universe and God.", author: "Pythagoras", school: "Pre-Socratic", era: "6th Century BCE", themes: ["self", "truth"] },
  { text: "No man is free who is not master of himself.", author: "Pythagoras", school: "Pre-Socratic", era: "6th Century BCE", themes: ["freedom", "self"] },
  { text: "Rest satisfied with doing well, and leave others to talk of you as they please.", author: "Pythagoras", school: "Pre-Socratic", era: "6th Century BCE", themes: ["self", "freedom"] },

  // MODERN WISDOM
  { text: "The purpose of life is not to be happy. It is to be useful, to be honorable, to be compassionate.", author: "Ralph Waldo Emerson", school: "Transcendentalism", era: "19th Century", themes: ["meaning", "love"] },
  { text: "Nothing external to you has any power over you.", author: "Ralph Waldo Emerson", school: "Transcendentalism", era: "19th Century", themes: ["freedom", "self"] },
  { text: "The only way to have a friend is to be one.", author: "Ralph Waldo Emerson", school: "Transcendentalism", era: "19th Century", themes: ["love", "wisdom"] },
  { text: "All life is an experiment. The more experiments you make the better.", author: "Ralph Waldo Emerson", school: "Transcendentalism", era: "19th Century", themes: ["courage", "meaning"] },
  { text: "Our greatest glory is not in never failing, but in rising up every time we fail.", author: "Ralph Waldo Emerson", school: "Transcendentalism", era: "19th Century", themes: ["courage", "change"] },
  { text: "Write it on your heart that every day is the best day in the year.", author: "Ralph Waldo Emerson", school: "Transcendentalism", era: "19th Century", themes: ["joy", "meaning"] },
  { text: "Live in the sunshine, swim the sea, drink the wild air.", author: "Ralph Waldo Emerson", school: "Transcendentalism", era: "19th Century", themes: ["joy", "freedom"] },
  { text: "What you are comes to you.", author: "Ralph Waldo Emerson", school: "Transcendentalism", era: "19th Century", themes: ["self", "truth"] },
  { text: "Simplicity, simplicity, simplicity! Let your affairs be as two or three.", author: "Henry David Thoreau", school: "Transcendentalism", era: "19th Century", themes: ["wisdom", "freedom"] },
  { text: "An early-morning walk is a blessing for the whole day.", author: "Henry David Thoreau", school: "Transcendentalism", era: "19th Century", themes: ["joy", "wisdom"] },
  { text: "As if you could kill time without injuring eternity.", author: "Henry David Thoreau", school: "Transcendentalism", era: "19th Century", themes: ["meaning", "death"] },
  { text: "How vain it is to sit down to write when you have not stood up to live.", author: "Henry David Thoreau", school: "Transcendentalism", era: "19th Century", themes: ["meaning", "truth"] },
  { text: "Our life is frittered away by detail. Simplify, simplify.", author: "Henry David Thoreau", school: "Transcendentalism", era: "19th Century", themes: ["wisdom", "freedom"] },

  // KAHLIL GIBRAN
  { text: "Your pain is the breaking of the shell that encloses your understanding.", author: "Kahlil Gibran", school: "Eastern Philosophy", era: "20th Century", themes: ["suffering", "wisdom"] },
  { text: "Out of suffering have emerged the strongest souls; the most massive characters are seared with scars.", author: "Kahlil Gibran", school: "Eastern Philosophy", era: "20th Century", themes: ["suffering", "courage"] },
  { text: "You give but little when you give of your possessions. It is when you give of yourself that you truly give.", author: "Kahlil Gibran", school: "Eastern Philosophy", era: "20th Century", themes: ["love", "meaning"] },
  { text: "The deeper that sorrow carves into your being, the more joy you can contain.", author: "Kahlil Gibran", school: "Eastern Philosophy", era: "20th Century", themes: ["suffering", "joy"] },
  { text: "Your children are not your children. They are the sons and daughters of Life's longing for itself.", author: "Kahlil Gibran", school: "Eastern Philosophy", era: "20th Century", themes: ["love", "freedom"] },
  { text: "If you love somebody, let them go, for if they return, they were always yours.", author: "Kahlil Gibran", school: "Eastern Philosophy", era: "20th Century", themes: ["love", "freedom"] },
  { text: "Yesterday is but today's memory, and tomorrow is today's dream.", author: "Kahlil Gibran", school: "Eastern Philosophy", era: "20th Century", themes: ["wisdom", "meaning"] },
  { text: "Trust in dreams, for in them is hidden the gate to eternity.", author: "Kahlil Gibran", school: "Eastern Philosophy", era: "20th Century", themes: ["meaning", "truth"] },

  // SIMONE WEIL
  { text: "Attention is the rarest and purest form of generosity.", author: "Simone Weil", school: "Phenomenology", era: "20th Century", themes: ["love", "wisdom"] },
  { text: "The love of our neighbor in all its fullness simply means being able to say, 'What are you going through?'", author: "Simone Weil", school: "Phenomenology", era: "20th Century", themes: ["love", "truth"] },
  { text: "Absolutely unmixed attention is prayer.", author: "Simone Weil", school: "Phenomenology", era: "20th Century", themes: ["wisdom", "meaning"] },
  { text: "To be rooted is perhaps the most important and least recognized need of the human soul.", author: "Simone Weil", school: "Phenomenology", era: "20th Century", themes: ["meaning", "self"] },

  // MORE AFRICAN PROVERBS
  { text: "The child who is not embraced by the village will burn it down to feel its warmth.", author: "African Proverb", school: "African Philosophy", era: "Traditional", themes: ["love", "suffering"] },
  { text: "A wise person will always find a way.", author: "African Proverb", school: "African Philosophy", era: "Traditional", themes: ["wisdom", "courage"] },
  { text: "Knowledge is like a garden: if it is not cultivated, it cannot be harvested.", author: "African Proverb", school: "African Philosophy", era: "Traditional", themes: ["wisdom", "change"] },
  { text: "The fool speaks, the wise man listens.", author: "Ethiopian Proverb", school: "African Philosophy", era: "Traditional", themes: ["wisdom", "truth"] },
  { text: "He who learns, teaches.", author: "Ethiopian Proverb", school: "African Philosophy", era: "Traditional", themes: ["wisdom", "love"] },
  { text: "When the roots are deep, there is no reason to fear the wind.", author: "African Proverb", school: "African Philosophy", era: "Traditional", themes: ["courage", "self"] },

  // HERMANN HESSE (Siddhartha) - Naval's recommendation via Tim Ferriss
  { text: "Wisdom cannot be imparted. Knowledge can be communicated, but not wisdom.", author: "Hermann Hesse", school: "Literary Philosophy", era: "20th Century", themes: ["wisdom", "truth"] },
  { text: "Seeking means: having a goal. But finding means: being free, being open, having no goal.", author: "Hermann Hesse", school: "Literary Philosophy", era: "20th Century", themes: ["freedom", "meaning"] },
  { text: "Have you also learned that secret from the river; that there is no such thing as time?", author: "Hermann Hesse", school: "Literary Philosophy", era: "20th Century", themes: ["truth", "change"] },
  { text: "Words do not express thoughts very well. They always become a little different immediately after they are expressed.", author: "Hermann Hesse", school: "Literary Philosophy", era: "20th Century", themes: ["truth", "wisdom"] },
  { text: "Gentleness is stronger than severity, water is stronger than rock, love is stronger than force.", author: "Hermann Hesse", school: "Literary Philosophy", era: "20th Century", themes: ["love", "courage"] },
  { text: "We are not going in circles, we are going upwards. The path is a spiral; we have already climbed many steps.", author: "Hermann Hesse", school: "Literary Philosophy", era: "20th Century", themes: ["change", "meaning"] },
  { text: "It is not for me to judge another man's life. I must judge, I must choose, I must spurn, purely for myself.", author: "Hermann Hesse", school: "Literary Philosophy", era: "20th Century", themes: ["self", "freedom"] },

  // DAVID DEUTSCH (The Beginning of Infinity) - Naval's top recommendation
  { text: "The universe is not there to overwhelm us; it is our home, and our resource. The bigger the better.", author: "David Deutsch", school: "Critical Rationalism", era: "21st Century", themes: ["meaning", "courage"] },
  { text: "Optimism is the theory that all failures — all evils — are due to insufficient knowledge.", author: "David Deutsch", school: "Critical Rationalism", era: "21st Century", themes: ["truth", "courage"] },
  { text: "We are only just scratching the surface, and shall never be doing anything else.", author: "David Deutsch", school: "Critical Rationalism", era: "21st Century", themes: ["meaning", "wisdom"] },
  { text: "Without error-correction all information processing, and hence all knowledge-creation, is necessarily bounded.", author: "David Deutsch", school: "Critical Rationalism", era: "21st Century", themes: ["truth", "change"] },
  { text: "Problems are inevitable. Problems are soluble.", author: "David Deutsch", school: "Critical Rationalism", era: "21st Century", themes: ["courage", "wisdom"] },
  { text: "Fallibilism is essential for the initiation of unlimited knowledge growth — the beginning of infinity.", author: "David Deutsch", school: "Critical Rationalism", era: "21st Century", themes: ["truth", "freedom"] },

  // JORGE LUIS BORGES (Labyrinths, Ficciones) - Naval's favorite fiction philosopher
  { text: "There is no need to build a labyrinth when the entire universe is one.", author: "Jorge Luis Borges", school: "Literary Philosophy", era: "20th Century", themes: ["truth", "meaning"] },
  { text: "Time is the substance I am made of. Time is a river which sweeps me along, but I am the river.", author: "Jorge Luis Borges", school: "Literary Philosophy", era: "20th Century", themes: ["self", "change"] },
  { text: "To think is to forget a difference, to generalize, to abstract.", author: "Jorge Luis Borges", school: "Literary Philosophy", era: "20th Century", themes: ["wisdom", "truth"] },
  { text: "A man sets out to draw the world. Over time, he discovers that the patient labyrinth of lines traces the lineaments of his own face.", author: "Jorge Luis Borges", school: "Literary Philosophy", era: "20th Century", themes: ["self", "meaning"] },
  { text: "To fall in love is to create a religion that has a fallible god.", author: "Jorge Luis Borges", school: "Literary Philosophy", era: "20th Century", themes: ["love", "truth"] },

  // CHARLIE MUNGER (Poor Charlie's Almanack) - Naval recommendation
  { text: "The safest way to try to get what you want is to try to deserve what you want.", author: "Charlie Munger", school: "Practical Wisdom", era: "21st Century", themes: ["wisdom", "self"] },
  { text: "I constantly see people rise in life who are not the smartest, but they are learning machines.", author: "Charlie Munger", school: "Practical Wisdom", era: "21st Century", themes: ["wisdom", "change"] },
  { text: "The big money is not in the buying and selling, but in the waiting.", author: "Charlie Munger", school: "Practical Wisdom", era: "21st Century", themes: ["courage", "wisdom"] },
  { text: "Knowing what you don't know is more useful than being brilliant.", author: "Charlie Munger", school: "Practical Wisdom", era: "21st Century", themes: ["wisdom", "truth"] },
  { text: "All I want to know is where I'm going to die, so I'll never go there.", author: "Charlie Munger", school: "Practical Wisdom", era: "21st Century", themes: ["wisdom", "death"] },
  { text: "Show me the incentive, and I will show you the outcome.", author: "Charlie Munger", school: "Practical Wisdom", era: "21st Century", themes: ["truth", "wisdom"] },
  { text: "I did not succeed in life by intelligence. I succeeded because I have a long attention span.", author: "Charlie Munger", school: "Practical Wisdom", era: "21st Century", themes: ["self", "wisdom"] },
  { text: "In my whole life, I have known no wise people who didn't read all the time — none, zero.", author: "Charlie Munger", school: "Practical Wisdom", era: "21st Century", themes: ["wisdom", "truth"] },

  // KARL POPPER (Objective Knowledge) - Naval recommendation
  { text: "Our knowledge can only be finite, while our ignorance must necessarily be infinite.", author: "Karl Popper", school: "Critical Rationalism", era: "20th Century", themes: ["wisdom", "truth"] },
  { text: "True ignorance is not the absence of knowledge, but the refusal to acquire it.", author: "Karl Popper", school: "Critical Rationalism", era: "20th Century", themes: ["wisdom", "truth"] },
  { text: "Science must begin with myths, and with the criticism of myths.", author: "Karl Popper", school: "Critical Rationalism", era: "20th Century", themes: ["truth", "change"] },
  { text: "Whenever a theory appears to you as the only possible one, take this as a sign that you have neither understood the theory nor the problem.", author: "Karl Popper", school: "Critical Rationalism", era: "20th Century", themes: ["wisdom", "truth"] },
  { text: "The war of ideas is a Greek invention. It is the very basis of our civilization.", author: "Karl Popper", school: "Critical Rationalism", era: "20th Century", themes: ["truth", "freedom"] },
  { text: "We must plan for freedom, and not only for security, if for no other reason than that only freedom can make security secure.", author: "Karl Popper", school: "Critical Rationalism", era: "20th Century", themes: ["freedom", "courage"] },
  { text: "The difference between the amoeba and Einstein is that Einstein is intrigued by his errors.", author: "Karl Popper", school: "Critical Rationalism", era: "20th Century", themes: ["wisdom", "change"] },

  // NAVAL RAVIKANT (The Almanack)
  { text: "Desire is a contract you make with yourself to be unhappy until you get what you want.", author: "Naval Ravikant", school: "Practical Wisdom", era: "21st Century", themes: ["suffering", "joy"] },
  { text: "A happy person isn't someone who's happy all the time. It's someone who effortlessly interprets events in such a way that they don't lose their innate peace.", author: "Naval Ravikant", school: "Practical Wisdom", era: "21st Century", themes: ["joy", "wisdom"] },
  { text: "Happiness is there when you remove the sense of something missing in your life.", author: "Naval Ravikant", school: "Practical Wisdom", era: "21st Century", themes: ["joy", "self"] },
  { text: "Read the greats in math, science, and philosophy. Ignore your contemporaries and news.", author: "Naval Ravikant", school: "Practical Wisdom", era: "21st Century", themes: ["wisdom", "truth"] },
  { text: "The most important skill for getting rich is becoming a perpetual learner.", author: "Naval Ravikant", school: "Practical Wisdom", era: "21st Century", themes: ["change", "wisdom"] },
  { text: "Escape competition through authenticity. No one can compete with you on being you.", author: "Naval Ravikant", school: "Practical Wisdom", era: "21st Century", themes: ["self", "freedom"] },
  { text: "A calm mind, a fit body, and a house full of love. These things cannot be bought. They must be earned.", author: "Naval Ravikant", school: "Practical Wisdom", era: "21st Century", themes: ["joy", "love"] },

  // NASSIM TALEB (Antifragile, The Black Swan)
  { text: "Antifragility is beyond resilience or robustness. The resilient resists shocks and stays the same; the antifragile gets better.", author: "Nassim Taleb", school: "Practical Wisdom", era: "21st Century", themes: ["change", "courage"] },
  { text: "Wind extinguishes a candle and energizes fire. Likewise with randomness, uncertainty, chaos: you want to use them, not hide from them.", author: "Nassim Taleb", school: "Practical Wisdom", era: "21st Century", themes: ["courage", "change"] },
  { text: "They will envy you for your success, your wealth, for your intelligence, for your looks — but rarely for your wisdom.", author: "Nassim Taleb", school: "Practical Wisdom", era: "21st Century", themes: ["wisdom", "self"] },
  { text: "Learn to fail with pride — and do so fast and cleanly. Maximize trial and error by mastering the error part.", author: "Nassim Taleb", school: "Practical Wisdom", era: "21st Century", themes: ["courage", "change"] },
  { text: "A Stoic is someone who transforms fear into prudence, pain into transformation, mistakes into initiation, and desire into undertaking.", author: "Nassim Taleb", school: "Practical Wisdom", era: "21st Century", themes: ["courage", "self"] },
  { text: "Missing a train is only painful if you run after it.", author: "Nassim Taleb", school: "Practical Wisdom", era: "21st Century", themes: ["wisdom", "suffering"] },
  { text: "I want to live happily in a world I don't understand.", author: "Nassim Taleb", school: "Practical Wisdom", era: "21st Century", themes: ["joy", "wisdom"] },
  { text: "Read books are far less valuable than unread ones. The library should contain as much of what you don't know as possible.", author: "Nassim Taleb", school: "Practical Wisdom", era: "21st Century", themes: ["wisdom", "truth"] },

  // MORE ALAN WATTS - unique additions
  { text: "To have faith is to trust yourself to the water. When you swim you don't grab hold of the water, because if you do you will sink and drown. Instead you relax, and float.", author: "Alan Watts", school: "Eastern Philosophy", era: "20th Century", themes: ["courage", "self"] },
  { text: "Zen does not confuse spirituality with thinking about God while one is peeling potatoes. Zen spirituality is just to peel the potatoes.", author: "Alan Watts", school: "Eastern Philosophy", era: "20th Century", themes: ["wisdom", "meaning"] },
  { text: "I have realized that the past and future are real illusions, that they exist in the present, which is what there is and all there is.", author: "Alan Watts", school: "Eastern Philosophy", era: "20th Century", themes: ["truth", "change"] },
  { text: "A scholar tries to learn something everyday; a student of Buddhism tries to unlearn something daily.", author: "Alan Watts", school: "Eastern Philosophy", era: "20th Century", themes: ["wisdom", "self"] },
  { text: "If you go off into a far, far forest and get very quiet, you'll come to understand that you're connected with everything.", author: "Alan Watts", school: "Eastern Philosophy", era: "20th Century", themes: ["self", "love"] },

  // MILAN KUNDERA (The Unbearable Lightness of Being) - Tim Ferriss recommendation
  { text: "For there is nothing heavier than compassion. Not even one's own pain weighs so heavy as the pain one feels with someone, for someone.", author: "Milan Kundera", school: "Literary Philosophy", era: "20th Century", themes: ["love", "suffering"] },
  { text: "True human goodness can come to the fore only when its recipient has no power. Mankind's true moral test consists of its attitude towards those who are at its mercy.", author: "Milan Kundera", school: "Literary Philosophy", era: "20th Century", themes: ["love", "truth"] },
  { text: "Living only one life, we can neither compare it with our previous lives nor perfect it in our lives to come.", author: "Milan Kundera", school: "Literary Philosophy", era: "20th Century", themes: ["meaning", "change"] },

  // MORE MARCUS AURELIUS (lesser-known Meditations)
  { text: "Think of yourself as dead. You have lived your life. Now take what's left and live it properly.", author: "Marcus Aurelius", school: "Stoicism", era: "2nd Century", themes: ["death", "meaning"] },
  { text: "It is the responsibility of leadership to work intelligently with what is given, and not waste time fantasizing about a world of flawless people and perfect choices.", author: "Marcus Aurelius", school: "Stoicism", era: "2nd Century", themes: ["wisdom", "courage"] },
  { text: "It's silly to try to escape other people's faults. They are inescapable. Just try to escape your own.", author: "Marcus Aurelius", school: "Stoicism", era: "2nd Century", themes: ["self", "wisdom"] },
  { text: "Because most of what we say and do is not essential. Ask yourself at every moment, 'Is this necessary?'", author: "Marcus Aurelius", school: "Stoicism", era: "2nd Century", themes: ["wisdom", "self"] },
  { text: "To stand up straight — not straightened.", author: "Marcus Aurelius", school: "Stoicism", era: "2nd Century", themes: ["self", "courage"] },
  { text: "The mind freed from passions is an impenetrable fortress — a person has no more secure place of refuge for all time.", author: "Marcus Aurelius", school: "Stoicism", era: "2nd Century", themes: ["freedom", "self"] },

  // MORE SENECA (Letters from a Stoic) - Naval's most-listened audiobook
  { text: "Fear keeps pace with hope. Both belong to a mind in suspense, to a mind in a state of anxiety through looking into the future.", author: "Seneca", school: "Stoicism", era: "1st Century", themes: ["courage", "wisdom"] },
  { text: "A gem cannot be polished without friction, nor a man perfected without trials.", author: "Seneca", school: "Stoicism", era: "1st Century", themes: ["suffering", "change"] },
  { text: "If you really want to escape the things that harass you, what you're needing is not to be in a different place but to be a different person.", author: "Seneca", school: "Stoicism", era: "1st Century", themes: ["self", "change"] },
  { text: "What progress, you ask, have I made? I have begun to be a friend to myself.", author: "Seneca", school: "Stoicism", era: "1st Century", themes: ["self", "love"] },
  { text: "The whole future lies in uncertainty: live immediately.", author: "Seneca", school: "Stoicism", era: "1st Century", themes: ["meaning", "courage"] },
  { text: "Until we have begun to go without them, we fail to realize how unnecessary many things are. We've been using them not because we needed them but because we had them.", author: "Seneca", school: "Stoicism", era: "1st Century", themes: ["freedom", "wisdom"] },
  { text: "To win true freedom you must be a slave to philosophy.", author: "Seneca", school: "Stoicism", era: "1st Century", themes: ["freedom", "wisdom"] },
  { text: "Associate with those who will make a better man of you. Welcome those whom you yourself can improve. The process is mutual.", author: "Seneca", school: "Stoicism", era: "1st Century", themes: ["love", "wisdom"] },

  // MORE RUMI - Sufi Poetry (unique additions)
  { text: "Your task is not to seek for love, but merely to seek and find all the barriers within yourself that you have built against it.", author: "Rumi", school: "Sufism", era: "13th Century", themes: ["love", "self"] },
  { text: "Love is the bridge between you and everything.", author: "Rumi", school: "Sufism", era: "13th Century", themes: ["love", "truth"] },
  { text: "Let the beauty of what you love be what you do.", author: "Rumi", school: "Sufism", era: "13th Century", themes: ["love", "meaning"] },

  // KAHLIL GIBRAN (The Prophet)
  { text: "The teacher who is indeed wise does not bid you to enter the house of his wisdom but rather leads you to the threshold of your mind.", author: "Kahlil Gibran", school: "Literary Philosophy", era: "20th Century", themes: ["wisdom", "truth"] },
  { text: "Your children are not your children. They are the sons and daughters of Life's longing for itself.", author: "Kahlil Gibran", school: "Literary Philosophy", era: "20th Century", themes: ["love", "freedom"] },
  { text: "Out of suffering have emerged the strongest souls; the most massive characters are seared with scars.", author: "Kahlil Gibran", school: "Literary Philosophy", era: "20th Century", themes: ["suffering", "courage"] },
  { text: "Wake at dawn with a winged heart and give thanks for another day of loving.", author: "Kahlil Gibran", school: "Literary Philosophy", era: "20th Century", themes: ["joy", "love"] },
  { text: "Keep me away from the wisdom which does not cry, the philosophy which does not laugh and the greatness which does not bow before children.", author: "Kahlil Gibran", school: "Literary Philosophy", era: "20th Century", themes: ["wisdom", "joy"] },
  { text: "Trees are poems that the earth writes upon the sky.", author: "Kahlil Gibran", school: "Literary Philosophy", era: "20th Century", themes: ["truth", "joy"] },
  { text: "Let there be spaces in your togetherness, and let the winds of the heavens dance between you.", author: "Kahlil Gibran", school: "Literary Philosophy", era: "20th Century", themes: ["love", "freedom"] },

  // DOSTOEVSKY (Brothers Karamazov, Crime and Punishment)
  { text: "Above all, don't lie to yourself. The man who lies to himself and listens to his own lie comes to a point that he cannot distinguish the truth within him.", author: "Fyodor Dostoevsky", school: "Literary Philosophy", era: "19th Century", themes: ["truth", "self"] },
  { text: "What is hell? I maintain that it is the suffering of being unable to love.", author: "Fyodor Dostoevsky", school: "Literary Philosophy", era: "19th Century", themes: ["love", "suffering"] },
  { text: "The awful thing is that beauty is mysterious as well as terrible. God and the devil are fighting there and the battlefield is the heart of man.", author: "Fyodor Dostoevsky", school: "Literary Philosophy", era: "19th Century", themes: ["self", "truth"] },
  { text: "It's the great mystery of human life that old grief passes gradually into quiet tender joy.", author: "Fyodor Dostoevsky", school: "Literary Philosophy", era: "19th Century", themes: ["suffering", "joy"] },
  { text: "Pain and suffering are always inevitable for a large intelligence and a deep heart.", author: "Fyodor Dostoevsky", school: "Literary Philosophy", era: "19th Century", themes: ["suffering", "wisdom"] },
  { text: "To go wrong in one's own way is better than to go right in someone else's.", author: "Fyodor Dostoevsky", school: "Literary Philosophy", era: "19th Century", themes: ["self", "freedom"] },
  { text: "This is my last message to you: in sorrow, seek happiness.", author: "Fyodor Dostoevsky", school: "Literary Philosophy", era: "19th Century", themes: ["joy", "suffering"] },

  // RALPH WALDO EMERSON (Self-Reliance, Transcendentalism)
  { text: "A foolish consistency is the hobgoblin of little minds.", author: "Ralph Waldo Emerson", school: "Transcendentalism", era: "19th Century", themes: ["freedom", "self"] },
  { text: "To be great is to be misunderstood.", author: "Ralph Waldo Emerson", school: "Transcendentalism", era: "19th Century", themes: ["self", "courage"] },
  { text: "Trust thyself: every heart vibrates to that iron string.", author: "Ralph Waldo Emerson", school: "Transcendentalism", era: "19th Century", themes: ["self", "courage"] },
  { text: "Nothing can bring you peace but yourself. Nothing can bring you peace but the triumph of principles.", author: "Ralph Waldo Emerson", school: "Transcendentalism", era: "19th Century", themes: ["self", "wisdom"] },
  { text: "What I must do is all that concerns me, not what the people think.", author: "Ralph Waldo Emerson", school: "Transcendentalism", era: "19th Century", themes: ["self", "freedom"] },
  { text: "Whoso would be a man, must be a nonconformist.", author: "Ralph Waldo Emerson", school: "Transcendentalism", era: "19th Century", themes: ["freedom", "courage"] },

  // HENRY DAVID THOREAU (Walden)
  { text: "I went to the woods because I wished to live deliberately, to front only the essential facts of life.", author: "Henry David Thoreau", school: "Transcendentalism", era: "19th Century", themes: ["meaning", "self"] },
  { text: "Simplicity, simplicity, simplicity! Let your affairs be as two or three, and not a hundred or a thousand.", author: "Henry David Thoreau", school: "Transcendentalism", era: "19th Century", themes: ["wisdom", "freedom"] },
  { text: "If one advances confidently in the direction of his dreams, he will meet with a success unexpected in common hours.", author: "Henry David Thoreau", school: "Transcendentalism", era: "19th Century", themes: ["courage", "meaning"] },
  { text: "We need the tonic of wildness.", author: "Henry David Thoreau", school: "Transcendentalism", era: "19th Century", themes: ["joy", "freedom"] },
  { text: "Time is but the stream I go a-fishing in.", author: "Henry David Thoreau", school: "Transcendentalism", era: "19th Century", themes: ["change", "meaning"] },
  { text: "Heaven is under our feet as well as over our heads.", author: "Henry David Thoreau", school: "Transcendentalism", era: "19th Century", themes: ["joy", "truth"] },
  { text: "Live in each season as it passes; breathe the air, drink the drink, taste the fruit.", author: "Henry David Thoreau", school: "Transcendentalism", era: "19th Century", themes: ["joy", "meaning"] },

  // MORE VIKTOR FRANKL (Man's Search for Meaning) - unique additions
  { text: "In some ways, suffering ceases to be suffering at the moment it finds a meaning.", author: "Viktor Frankl", school: "Existentialism", era: "20th Century", themes: ["suffering", "meaning"] },
  { text: "Life is never made unbearable by circumstances, but only by lack of meaning and purpose.", author: "Viktor Frankl", school: "Existentialism", era: "20th Century", themes: ["meaning", "suffering"] },

  // MORE ALBERT CAMUS (The Myth of Sisyphus) - unique additions
  { text: "There is but one truly serious philosophical problem, and that is suicide.", author: "Albert Camus", school: "Absurdism", era: "20th Century", themes: ["meaning", "death"] },
  { text: "The absurd is born of this confrontation between the human need and the unreasonable silence of the world.", author: "Albert Camus", school: "Absurdism", era: "20th Century", themes: ["truth", "meaning"] },
  { text: "Should I kill myself, or have a cup of coffee?", author: "Albert Camus", school: "Absurdism", era: "20th Century", themes: ["meaning", "joy"] },
  { text: "Nobody realizes that some people expend tremendous energy merely to be normal.", author: "Albert Camus", school: "Absurdism", era: "20th Century", themes: ["self", "suffering"] },

  // BARUCH SPINOZA (Ethics)
  { text: "A free man thinks of nothing less than of death, and his wisdom is a meditation, not on death, but on life.", author: "Baruch Spinoza", school: "Rationalism", era: "17th Century", themes: ["death", "wisdom"] },
  { text: "I have made a ceaseless effort not to ridicule, not to bewail, not to scorn human actions, but to understand them.", author: "Baruch Spinoza", school: "Rationalism", era: "17th Century", themes: ["wisdom", "love"] },
  { text: "Emotion, which is suffering, ceases to be suffering as soon as we form a clear and precise picture of it.", author: "Baruch Spinoza", school: "Rationalism", era: "17th Century", themes: ["suffering", "wisdom"] },
  { text: "Nothing in Nature is random. A thing appears random only through the incompleteness of our knowledge.", author: "Baruch Spinoza", school: "Rationalism", era: "17th Century", themes: ["truth", "wisdom"] },
  { text: "Happiness is not the reward of virtue, but is virtue itself.", author: "Baruch Spinoza", school: "Rationalism", era: "17th Century", themes: ["joy", "self"] },
  { text: "The ultimate aim of government is not to rule, or restrain by fear, but to free every man from fear that he may live in all possible security.", author: "Baruch Spinoza", school: "Rationalism", era: "17th Century", themes: ["freedom", "courage"] },

  // BLAISE PASCAL (Pensées)
  { text: "The heart has its reasons of which reason knows nothing.", author: "Blaise Pascal", school: "Christian Philosophy", era: "17th Century", themes: ["love", "truth"] },
  { text: "All men's miseries derive from not being able to sit in a quiet room alone.", author: "Blaise Pascal", school: "Christian Philosophy", era: "17th Century", themes: ["self", "wisdom"] },
  { text: "Man is only a reed, the weakest in nature, but he is a thinking reed.", author: "Blaise Pascal", school: "Christian Philosophy", era: "17th Century", themes: ["self", "wisdom"] },
  { text: "There are two equally dangerous extremes: to exclude reason, to admit nothing but reason.", author: "Blaise Pascal", school: "Christian Philosophy", era: "17th Century", themes: ["truth", "wisdom"] },
  { text: "In faith there is enough light for those who want to believe and enough shadows to blind those who don't.", author: "Blaise Pascal", school: "Christian Philosophy", era: "17th Century", themes: ["truth", "courage"] },
  { text: "The supreme function of reason is to show man that some things are beyond reason.", author: "Blaise Pascal", school: "Christian Philosophy", era: "17th Century", themes: ["wisdom", "truth"] },

  // MORE THICH NHAT HANH (Mindfulness) - unique additions
  { text: "There is no way to happiness — happiness is the way.", author: "Thich Nhat Hanh", school: "Buddhism", era: "20th Century", themes: ["joy", "truth"] },
  { text: "Breathing in, I calm body and mind. Breathing out, I smile. Dwelling in the present moment I know this is the only moment.", author: "Thich Nhat Hanh", school: "Buddhism", era: "20th Century", themes: ["joy", "self"] },
  { text: "Many people think excitement is happiness. But when you are excited you are not peaceful. True happiness is based on peace.", author: "Thich Nhat Hanh", school: "Buddhism", era: "20th Century", themes: ["joy", "wisdom"] },
  { text: "Hope is important because it can make the present moment less difficult to bear. If we believe that tomorrow will be better, we can bear a hardship today.", author: "Thich Nhat Hanh", school: "Buddhism", era: "20th Century", themes: ["courage", "suffering"] },
  { text: "The mind can go in a thousand directions, but on this beautiful path, I walk in peace.", author: "Thich Nhat Hanh", school: "Buddhism", era: "20th Century", themes: ["self", "joy"] },
  { text: "Anxiety, the illness of our time, comes primarily from our inability to dwell in the present moment.", author: "Thich Nhat Hanh", school: "Buddhism", era: "20th Century", themes: ["suffering", "wisdom"] },
];

// ============================================================================
// THEME CATEGORIES
// ============================================================================

const allThemes = ['meaning', 'death', 'love', 'courage', 'change', 'self', 'suffering', 'joy', 'truth', 'freedom'];

const getThemeColor = (theme) => {
  const colors = {
    'meaning': '#FFD700',
    'death': '#9B59B6',
    'love': '#E8B4B8',
    'courage': '#F5A623',
    'change': '#1ABC9C',
    'self': '#BDC3C7',
    'suffering': '#C0392B',
    'joy': '#F1C40F',
    'truth': '#85C1E9',
    'freedom': '#5DADE2',
  };
  return colors[theme] || '#888';
};

// ============================================================================
// SCHOOL COLORS
// ============================================================================

const getSchoolColor = (school) => {
  const colors = {
    'Existentialism': '#E8B4B8',
    'Classical Greek': '#B4C7E8',
    'Stoicism': '#7FDBCA',
    'Buddhism': '#E8D4B4',
    'Pre-Socratic': '#D4B4E8',
    'Rationalism': '#B4E8E0',
    'German Idealism': '#E8E4B4',
    'Absurdism': '#FF9B9B',
    'Analytic Philosophy': '#A8D4E6',
    'Pessimism': '#9B9B9B',
    'Confucianism': '#E8C4B4',
    'Political Philosophy': '#C9B4E8',
    'Renaissance': '#E8B4C4',
    'Sufism': '#F5D5C8',
    'Taoism': '#B4E8D4',
    'Zen Buddhism': '#C5E8E8',
    'Eastern Philosophy': '#E8E0B4',
    'Mythology': '#E0B4E8',
    'Depth Psychology': '#D4C4E8',
    'Transcendentalism': '#C4E8B4',
    'African Philosophy': '#E8C4A4',
    'Native American': '#A4C4B4',
    'Feminist Philosophy': '#E4B4D4',
    'Vedanta': '#D4A4E8',
  };
  return colors[school] || '#C0C0C0';
};

const allSchools = [...new Set(allQuotes.map(q => q.school))].sort();

// ============================================================================
// THEME SYSTEM
// ============================================================================

const themes = {
  void: {
    name: 'Void',
    bg: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0d0d14 50%, #000 100%)',
    text: '#E8E6E3',
    textMuted: '#888',
    accent: '#E8E6E3',
    cardBg: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.1)',
  },
  cosmos: {
    name: 'Cosmos',
    bg: 'radial-gradient(ellipse at center, #1a1a3e 0%, #0d0d1a 50%, #050508 100%)',
    text: '#E0E0F0',
    textMuted: '#8888AA',
    accent: '#A0A0D0',
    cardBg: 'rgba(160,160,208,0.05)',
    border: 'rgba(160,160,208,0.15)',
  },
  dawn: {
    name: 'Dawn',
    bg: 'radial-gradient(ellipse at center, #f5f0e8 0%, #e8e0d4 50%, #d4c8b8 100%)',
    text: '#2a2520',
    textMuted: '#6a6560',
    accent: '#8B7355',
    cardBg: 'rgba(139,115,85,0.08)',
    border: 'rgba(139,115,85,0.2)',
  },
  ink: {
    name: 'Ink',
    bg: '#000',
    text: '#F0F0F0',
    textMuted: '#666',
    accent: '#FFFFFF',
    cardBg: 'rgba(255,255,255,0.02)',
    border: 'rgba(255,255,255,0.08)',
  },
};

const ThemeContext = createContext(themes.void);

// ============================================================================
// SETTINGS
// ============================================================================

const defaultSettings = {
  theme: 'void',
  scrollSpeed: 1,
  depthEffect: true,
  particles: true,
  reducedMotion: false,
};

const STORAGE_KEYS = {
  SAVED_QUOTES: 'philos_saved_quotes',
  DAILY_QUOTE: 'philos_daily_quote',
  DAILY_QUOTE_DATE: 'philos_daily_quote_date',
  SETTINGS: 'philos_settings',
};

// ============================================================================
// UTILITIES
// ============================================================================

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const loadSavedQuotes = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SAVED_QUOTES);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
};

const saveSavedQuotes = (quotes) => {
  try { localStorage.setItem(STORAGE_KEYS.SAVED_QUOTES, JSON.stringify(quotes)); } catch {}
};

const loadSettings = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const settings = saved ? JSON.parse(saved) : defaultSettings;
    // Check for OS preference
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      settings.reducedMotion = true;
    }
    return settings;
  } catch { return defaultSettings; }
};

const saveSettings = (settings) => {
  try { localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings)); } catch {}
};

const getDailyQuote = () => {
  try {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem(STORAGE_KEYS.DAILY_QUOTE_DATE);
    if (savedDate === today) {
      const savedQuote = localStorage.getItem(STORAGE_KEYS.DAILY_QUOTE);
      if (savedQuote) return JSON.parse(savedQuote);
    }
    const randomQuote = allQuotes[Math.floor(Math.random() * allQuotes.length)];
    localStorage.setItem(STORAGE_KEYS.DAILY_QUOTE, JSON.stringify(randomQuote));
    localStorage.setItem(STORAGE_KEYS.DAILY_QUOTE_DATE, today);
    return randomQuote;
  } catch { return allQuotes[0]; }
};

const shareQuote = async (quote) => {
  const text = '"' + quote.text + '"\n\n— ' + quote.author;
  if (navigator.share) {
    try { await navigator.share({ title: 'Wisdom from Philos', text }); }
    catch (e) { if (e.name !== 'AbortError') navigator.clipboard.writeText(text); }
  } else { navigator.clipboard.writeText(text); }
};

// ============================================================================
// EASING FUNCTIONS
// ============================================================================

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function Philos() {
  // Core state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedQuotes, setSavedQuotes] = useState([]);
  const [shuffledQuotes, setShuffledQuotes] = useState([]);
  const [view, setView] = useState('scroll');
  const [selectedSchools, setSelectedSchools] = useState(new Set());
  const [selectedThemes, setSelectedThemes] = useState(new Set());
  const [toast, setToast] = useState(null);
  const [settings, setSettings] = useState(defaultSettings);
  const [showSettings, setShowSettings] = useState(false);

  // ============================================================================
  // SCROLL STATE
  // ============================================================================

  const [displayProgress, setDisplayProgress] = useState(0);
  const isAnimating = useRef(false);
  const touchHistory = useRef([]);
  const touchStartY = useRef(0);
  const lastTouchY = useRef(0);
  const containerRef = useRef(null);

  // Typewriter effect state
  const [revealedChars, setRevealedChars] = useState(0);
  const typewriterRef = useRef(null);

  // Get current theme
  const currentTheme = themes[settings.theme] || themes.void;

  // Initialize
  useEffect(() => {
    const saved = loadSavedQuotes();
    setSavedQuotes(saved);
    setShuffledQuotes(shuffleArray(allQuotes));
    setSettings(loadSettings());
  }, []);

  // Filter quotes
  const filteredQuotes = shuffledQuotes.filter(q => {
    const schoolMatch = selectedSchools.size === 0 || selectedSchools.has(q.school);
    const themeMatch = selectedThemes.size === 0 || (q.themes && q.themes.some(t => selectedThemes.has(t)));
    return schoolMatch && themeMatch;
  });

  const currentQuote = filteredQuotes[currentIndex % Math.max(filteredQuotes.length, 1)];
  const nextQuote = filteredQuotes[(currentIndex + 1) % Math.max(filteredQuotes.length, 1)];

  // ============================================================================
  // TYPEWRITER EFFECT - Letters appear like handwriting
  // ============================================================================

  useEffect(() => {
    if (!currentQuote) return;

    // Clear any existing animation
    if (typewriterRef.current) {
      clearInterval(typewriterRef.current);
    }

    // Reset to 0 and start revealing
    setRevealedChars(0);
    const text = currentQuote.text;
    let charIndex = 0;

    // Variable speed: faster for spaces, slower for punctuation
    const getDelay = (char) => {
      if (char === ' ') return 20;
      if (['.', ',', ';', ':', '—', '–'].includes(char)) return 120;
      if (['?', '!'].includes(char)) return 150;
      return 35 + Math.random() * 25; // 35-60ms, slight variation for natural feel
    };

    const revealNext = () => {
      if (charIndex < text.length) {
        charIndex++;
        setRevealedChars(charIndex);
        typewriterRef.current = setTimeout(revealNext, getDelay(text[charIndex]));
      }
    };

    // Small delay before starting (let the smoke clear)
    typewriterRef.current = setTimeout(revealNext, 400);

    return () => {
      if (typewriterRef.current) {
        clearTimeout(typewriterRef.current);
      }
    };
  }, [currentIndex, currentQuote]);

  // ============================================================================
  // SIMPLE SCROLL SYSTEM - Direct, responsive, no fighting physics
  // ============================================================================

  // Go to next/previous quote with smooth CSS transition
  const goToQuote = useCallback((direction) => {
    if (isAnimating.current) return;

    const newIndex = direction > 0
      ? (currentIndex + 1) % filteredQuotes.length
      : Math.max(0, currentIndex - 1);

    if (newIndex === currentIndex) return;

    isAnimating.current = true;
    setDisplayProgress(direction > 0 ? 1 : -1);

    setTimeout(() => {
      setCurrentIndex(newIndex);
      setDisplayProgress(0);
      isAnimating.current = false;
    }, 800); // Slower, like smoke clearing
  }, [currentIndex, filteredQuotes.length]);

  // Accumulated scroll for threshold detection
  const scrollAccum = useRef(0);
  const SCROLL_THRESHOLD = 80; // Pixels needed to trigger next quote

  // ============================================================================
  // INPUT HANDLERS - Simple and direct
  // ============================================================================

  const handleWheel = useCallback((e) => {
    if (view !== 'scroll' || isAnimating.current) return;
    e.preventDefault();

    scrollAccum.current += e.deltaY * settings.scrollSpeed;

    if (scrollAccum.current > SCROLL_THRESHOLD) {
      scrollAccum.current = 0;
      goToQuote(1);
    } else if (scrollAccum.current < -SCROLL_THRESHOLD) {
      scrollAccum.current = 0;
      goToQuote(-1);
    }
  }, [view, settings.scrollSpeed, goToQuote]);

  const handleTouchStart = useCallback((e) => {
    if (view !== 'scroll') return;
    touchStartY.current = e.touches[0].clientY;
    lastTouchY.current = e.touches[0].clientY;
    touchHistory.current = [{ y: e.touches[0].clientY, time: Date.now() }];
  }, [view]);

  const handleTouchMove = useCallback((e) => {
    if (view !== 'scroll' || isAnimating.current) return;
    e.preventDefault();

    const touchY = e.touches[0].clientY;
    const totalDelta = touchStartY.current - touchY;

    // Track for velocity
    touchHistory.current.push({ y: touchY, time: Date.now() });
    touchHistory.current = touchHistory.current.slice(-5);

    // Show visual feedback (subtle parallax)
    const progress = Math.max(-0.5, Math.min(0.5, totalDelta / 300));
    setDisplayProgress(progress);

    lastTouchY.current = touchY;
  }, [view]);

  const handleTouchEnd = useCallback(() => {
    if (view !== 'scroll' || isAnimating.current) return;

    const totalDelta = touchStartY.current - lastTouchY.current;

    // Calculate velocity from recent touches
    const recent = touchHistory.current;
    let velocity = 0;
    if (recent.length >= 2) {
      const first = recent[0];
      const last = recent[recent.length - 1];
      const dt = last.time - first.time;
      if (dt > 0) velocity = (first.y - last.y) / dt;
    }

    // Decide based on distance + velocity
    const dominated = Math.abs(totalDelta) > 50 || Math.abs(velocity) > 0.5;

    if (dominated && (totalDelta > 30 || velocity > 0.3)) {
      goToQuote(1);
    } else if (dominated && (totalDelta < -30 || velocity < -0.3)) {
      goToQuote(-1);
    } else {
      // Snap back
      setDisplayProgress(0);
    }
  }, [view, goToQuote]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (view !== 'scroll') return;

      if (e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        goToQuote(1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        goToQuote(-1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, goToQuote]);

  // ============================================================================
  // QUOTE MANAGEMENT
  // ============================================================================

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const toggleSave = (quote) => {
    const quoteId = quote.author + '-' + quote.text.substring(0, 30);
    const isCurrentlySaved = savedQuotes.some(q => q.author + '-' + q.text.substring(0, 30) === quoteId);
    let newSaved;
    if (isCurrentlySaved) {
      newSaved = savedQuotes.filter(q => q.author + '-' + q.text.substring(0, 30) !== quoteId);
      showToast('Removed from saved');
    } else {
      newSaved = [...savedQuotes, quote];
      showToast('Saved to collection');
    }
    setSavedQuotes(newSaved);
    saveSavedQuotes(newSaved);
  };

  const isQuoteSaved = (quote) => {
    if (!quote) return false;
    const quoteId = quote.author + '-' + quote.text.substring(0, 30);
    return savedQuotes.some(q => q.author + '-' + q.text.substring(0, 30) === quoteId);
  };

  const toggleSchool = (school) => {
    setSelectedSchools(prev => {
      const newSet = new Set(prev);
      if (newSet.has(school)) newSet.delete(school);
      else newSet.add(school);
      return newSet;
    });
    setCurrentIndex(0);
    indexRef.current = 0;
    physicsRef.current.position = 0;
    physicsRef.current.velocity = 0;
    applyTransforms(0);
  };

  const toggleTheme = (theme) => {
    setSelectedThemes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(theme)) newSet.delete(theme);
      else newSet.add(theme);
      return newSet;
    });
    setCurrentIndex(0);
    indexRef.current = 0;
    physicsRef.current.position = 0;
    physicsRef.current.velocity = 0;
    applyTransforms(0);
  };

  const updateSettings = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Visual transforms are now handled directly in applyTransforms via refs

  const dailyQuote = getDailyQuote();

  if (!currentQuote) {
    return (
      <div style={{ background: currentTheme.bg, color: currentTheme.text, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Loading...
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <ThemeContext.Provider value={currentTheme}>
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          minHeight: '100vh',
          height: '100vh',
          overflow: 'hidden',
          background: currentTheme.bg,
          color: currentTheme.text,
          fontFamily: '"Jost", sans-serif',
          position: 'relative',
          touchAction: view === 'scroll' ? 'none' : 'auto',
          transition: 'background 0.5s ease',
        }}
      >
        {/* Stars */}
        {settings.particles && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            {[...Array(60)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: Math.random() * 2 + 1 + 'px',
                  height: Math.random() * 2 + 1 + 'px',
                  background: currentTheme.text,
                  borderRadius: '50%',
                  left: Math.random() * 100 + '%',
                  top: Math.random() * 100 + '%',
                  opacity: Math.random() * 0.4 + 0.1,
                  animation: settings.reducedMotion ? 'none' : `twinkle ${Math.random() * 4 + 3}s ease-in-out infinite`,
                  animationDelay: Math.random() * 2 + 's',
                }}
              />
            ))}
          </div>
        )}

        {/* Aurora Borealis Effect */}
        {settings.particles && settings.theme !== 'dawn' && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '60%',
            overflow: 'hidden',
            pointerEvents: 'none',
            opacity: 0.15,
          }}>
            <div style={{
              position: 'absolute',
              top: '-20%',
              left: '-10%',
              right: '-10%',
              height: '80%',
              background: settings.theme === 'cosmos'
                ? 'linear-gradient(180deg, transparent 0%, rgba(100, 60, 180, 0.4) 30%, rgba(60, 120, 180, 0.3) 50%, rgba(40, 180, 140, 0.2) 70%, transparent 100%)'
                : 'linear-gradient(180deg, transparent 0%, rgba(40, 80, 120, 0.3) 30%, rgba(60, 140, 120, 0.2) 50%, rgba(80, 60, 140, 0.15) 70%, transparent 100%)',
              filter: 'blur(40px)',
              animation: settings.reducedMotion ? 'none' : 'aurora 15s ease-in-out infinite',
              transformOrigin: 'center top',
            }} />
            <div style={{
              position: 'absolute',
              top: '-10%',
              left: '20%',
              right: '-20%',
              height: '70%',
              background: settings.theme === 'cosmos'
                ? 'linear-gradient(180deg, transparent 0%, rgba(80, 140, 200, 0.3) 40%, rgba(120, 80, 160, 0.2) 60%, transparent 100%)'
                : 'linear-gradient(180deg, transparent 0%, rgba(60, 160, 140, 0.25) 40%, rgba(40, 100, 140, 0.15) 60%, transparent 100%)',
              filter: 'blur(50px)',
              animation: settings.reducedMotion ? 'none' : 'aurora 20s ease-in-out infinite reverse',
              animationDelay: '-5s',
              transformOrigin: 'center top',
            }} />
          </div>
        )}

        {/* Minimal Mountain Silhouette */}
        {settings.particles && settings.theme !== 'dawn' && (
          <svg
            viewBox="0 0 1440 320"
            preserveAspectRatio="xMidYMax slice"
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '35vh',
              minHeight: '180px',
              maxHeight: '320px',
              pointerEvents: 'none',
              opacity: 0.06,
            }}
          >
            {/* Far mountains */}
            <path
              d="M0,320 L0,220 L80,180 L160,200 L280,140 L380,170 L500,100 L620,150 L740,80 L880,130 L1020,60 L1160,110 L1300,70 L1440,120 L1440,320 Z"
              fill={currentTheme.text}
              opacity="0.4"
            />
            {/* Near mountains */}
            <path
              d="M0,320 L0,260 L120,220 L240,250 L400,180 L540,220 L680,160 L820,200 L980,140 L1140,190 L1300,150 L1440,180 L1440,320 Z"
              fill={currentTheme.text}
              opacity="0.7"
            />
          </svg>
        )}

        {/* Vignette */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: settings.theme === 'dawn'
            ? 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.1) 100%)'
            : 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
          pointerEvents: 'none',
          zIndex: 1,
        }} />

        {/* Header */}
        <header style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: settings.theme === 'dawn'
            ? 'linear-gradient(to bottom, rgba(245,240,232,0.9) 0%, transparent 100%)'
            : 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)',
          zIndex: 100,
        }}>
          <h1
            onClick={() => { setView('scroll'); physicsRef.current.position = 0; physicsRef.current.velocity = 0; indexRef.current = 0; setCurrentIndex(0); }}
            style={{
              fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontWeight: 400,
              letterSpacing: '0.2em',
              margin: 0,
              cursor: 'pointer',
              color: currentTheme.text,
              opacity: 0.9,
            }}
          >
            PHILOS
          </h1>
          <nav style={{ display: 'flex', gap: '0.5rem' }}>
            {[
              { key: 'daily', icon: '☀', label: 'Daily' },
              { key: 'filter', icon: '◉', label: 'Filter' },
              { key: 'saved', icon: '♡', label: String(savedQuotes.length) },
            ].map(({ key, icon, label }) => (
              <button
                key={key}
                onClick={() => setView(view === key ? 'scroll' : key)}
                style={{
                  background: view === key ? `${currentTheme.accent}22` : `${currentTheme.text}08`,
                  border: '1px solid',
                  borderColor: view === key ? `${currentTheme.accent}44` : currentTheme.border,
                  color: view === key ? currentTheme.text : currentTheme.textMuted,
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontFamily: '"Jost", sans-serif',
                  letterSpacing: '0.05em',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <span style={{ fontSize: '0.9rem' }}>{icon}</span>
                <span className="nav-label">{label}</span>
              </button>
            ))}
            <button
              onClick={() => setShowSettings(!showSettings)}
              style={{
                background: showSettings ? `${currentTheme.accent}22` : `${currentTheme.text}08`,
                border: '1px solid',
                borderColor: showSettings ? `${currentTheme.accent}44` : currentTheme.border,
                color: showSettings ? currentTheme.text : currentTheme.textMuted,
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.3s ease',
              }}
            >
              ⚙
            </button>
          </nav>
        </header>

        {/* Settings Drawer */}
        <div style={{
          position: 'fixed',
          top: 0,
          right: showSettings ? 0 : '-320px',
          width: '300px',
          height: '100vh',
          background: currentTheme.bg,
          borderLeft: `1px solid ${currentTheme.border}`,
          zIndex: 150,
          padding: '5rem 1.5rem 2rem',
          transition: 'right 0.3s ease',
          overflowY: 'auto',
        }}>
          <h3 style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: currentTheme.textMuted, marginBottom: '1.5rem' }}>Settings</h3>

          {/* Theme Selection */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ fontSize: '0.8rem', color: currentTheme.textMuted, display: 'block', marginBottom: '0.75rem' }}>Theme</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {Object.entries(themes).map(([key, theme]) => (
                <button
                  key={key}
                  onClick={() => updateSettings('theme', key)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: settings.theme === key ? `${currentTheme.accent}22` : currentTheme.cardBg,
                    border: `1px solid ${settings.theme === key ? currentTheme.accent : currentTheme.border}`,
                    borderRadius: '6px',
                    color: currentTheme.text,
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {theme.name}
                </button>
              ))}
            </div>
          </div>

          {/* Scroll Speed */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ fontSize: '0.8rem', color: currentTheme.textMuted, display: 'block', marginBottom: '0.75rem' }}>
              Scroll Speed: {settings.scrollSpeed}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.25"
              value={settings.scrollSpeed}
              onChange={(e) => updateSettings('scrollSpeed', parseFloat(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>

          {/* Toggles */}
          {[
            { key: 'depthEffect', label: 'Depth Effect' },
            { key: 'particles', label: 'Star Particles' },
            { key: 'reducedMotion', label: 'Reduce Motion' },
          ].map(({ key, label }) => (
            <div key={key} style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: currentTheme.text }}>{label}</span>
              <button
                onClick={() => updateSettings(key, !settings[key])}
                style={{
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  border: 'none',
                  background: settings[key] ? currentTheme.accent : currentTheme.border,
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.2s ease',
                }}
              >
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: '#fff',
                  position: 'absolute',
                  top: '3px',
                  left: settings[key] ? '23px' : '3px',
                  transition: 'left 0.2s ease',
                }} />
              </button>
            </div>
          ))}

          <div style={{ marginTop: '2rem', fontSize: '0.7rem', color: currentTheme.textMuted, textAlign: 'center' }}>
            {allQuotes.length} quotes from {allSchools.length} traditions
          </div>
        </div>

        {/* Settings Overlay */}
        {showSettings && (
          <div
            onClick={() => setShowSettings(false)}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.3)',
              zIndex: 140,
            }}
          />
        )}

        {/* Main Scroll View */}
        {view === 'scroll' && currentQuote && (
          <main style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
            {/* Quote Card - emerges like smoke */}
            <div
              style={{
                position: 'absolute',
                width: '100%',
                maxWidth: '700px',
                padding: '0 2rem',
                textAlign: 'center',
                willChange: 'transform, opacity, filter',
                transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s ease-out, filter 0.8s ease-out',
                opacity: Math.abs(displayProgress) > 0.3 ? 0 : 1 - Math.abs(displayProgress) * 2,
                filter: `blur(${Math.abs(displayProgress) * 12}px)`,
                transform: `translate3d(0, ${displayProgress * -40}px, 0) scale(${1 - Math.abs(displayProgress) * 0.05})`,
              }}
            >
              <blockquote style={{
                fontSize: 'clamp(1.4rem, 5vw, 2.5rem)',
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontWeight: 400,
                lineHeight: 1.5,
                color: currentTheme.text,
                margin: 0,
                fontStyle: 'italic',
                letterSpacing: '0.01em',
                textShadow: settings.theme === 'dawn' ? 'none' : '0 2px 20px rgba(0,0,0,0.5)',
              }}>
                "{currentQuote.text.slice(0, revealedChars)}"
                {revealedChars < currentQuote.text.length && (
                  <span style={{
                    opacity: 0.7,
                    animation: 'pulse 1s ease-in-out infinite',
                  }}>|</span>
                )}
              </blockquote>

              <div className="quote-meta" style={{
                marginTop: '2rem',
                transition: 'opacity 0.8s ease-out',
                opacity: revealedChars >= currentQuote.text.length
                  ? Math.max(0, 1 - Math.abs(displayProgress) * 3)
                  : 0,
              }}>
                <div style={{
                  fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                  fontFamily: '"Jost", sans-serif',
                  fontWeight: 500,
                  color: currentTheme.textMuted,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}>
                  {currentQuote.author}
                </div>

                <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{
                    padding: '0.3rem 0.8rem',
                    background: getSchoolColor(currentQuote.school) + '20',
                    borderRadius: '4px',
                    color: getSchoolColor(currentQuote.school),
                    fontSize: '0.7rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    border: '1px solid ' + getSchoolColor(currentQuote.school) + '40',
                  }}>
                    {currentQuote.school}
                  </span>
                  {currentQuote.themes && currentQuote.themes.slice(0, 2).map(theme => (
                    <span key={theme} style={{
                      padding: '0.25rem 0.6rem',
                      background: getThemeColor(theme) + '15',
                      borderRadius: '3px',
                      color: getThemeColor(theme),
                      fontSize: '0.65rem',
                      letterSpacing: '0.05em',
                      textTransform: 'lowercase',
                    }}>
                      {theme}
                    </span>
                  ))}
                  <span style={{ fontSize: '0.75rem', color: currentTheme.textMuted }}>{currentQuote.era}</span>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                  <button
                    onClick={() => toggleSave(currentQuote)}
                    style={{
                      background: currentTheme.cardBg,
                      border: `1px solid ${currentTheme.border}`,
                      color: isQuoteSaved(currentQuote) ? '#E8B4B8' : currentTheme.textMuted,
                      padding: '0.75rem 1.25rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>{isQuoteSaved(currentQuote) ? '♥' : '♡'}</span>Save
                  </button>
                  <button
                    onClick={() => shareQuote(currentQuote)}
                    style={{
                      background: currentTheme.cardBg,
                      border: `1px solid ${currentTheme.border}`,
                      color: currentTheme.textMuted,
                      padding: '0.75rem 1.25rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <span style={{ fontSize: '1rem' }}>↗</span>Share
                  </button>
                </div>
              </div>
            </div>

            {/* Scroll hint */}
            <div style={{
              position: 'absolute',
              bottom: '2rem',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: 0.4,
            }}>
              <span style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Scroll to discover</span>
              <div style={{
                width: '1px',
                height: '30px',
                background: `linear-gradient(to bottom, ${currentTheme.text}, transparent)`,
                animation: settings.reducedMotion ? 'none' : 'scrollPulse 2s ease-in-out infinite',
              }} />
            </div>

            {/* Progress indicator */}
            <div style={{
              position: 'absolute',
              right: '1.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}>
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: '3px',
                    height: '20px',
                    background: i === 2 ? currentTheme.text : currentTheme.border,
                    opacity: i === 2 ? 0.6 : 0.2,
                    borderRadius: '2px',
                    transition: 'background 0.3s ease',
                  }}
                />
              ))}
            </div>
          </main>
        )}

        {/* Daily View */}
        {view === 'daily' && (
          <main style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 2, padding: '2rem' }}>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: currentTheme.textMuted, marginBottom: '2rem' }}>☀ Today's Wisdom</div>
            <blockquote style={{
              fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontWeight: 400,
              lineHeight: 1.5,
              color: currentTheme.text,
              margin: 0,
              fontStyle: 'italic',
              textAlign: 'center',
              maxWidth: '700px',
            }}>
              "{dailyQuote.text}"
            </blockquote>
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontFamily: '"Jost", sans-serif', fontWeight: 500, color: currentTheme.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{dailyQuote.author}</div>
              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                <span style={{ padding: '0.3rem 0.8rem', background: getSchoolColor(dailyQuote.school) + '20', borderRadius: '4px', color: getSchoolColor(dailyQuote.school), fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{dailyQuote.school}</span>
              </div>
            </div>
            <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem' }}>
              <button onClick={() => toggleSave(dailyQuote)} style={{ background: currentTheme.cardBg, border: `1px solid ${currentTheme.border}`, color: isQuoteSaved(dailyQuote) ? '#E8B4B8' : currentTheme.textMuted, padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>{isQuoteSaved(dailyQuote) ? '♥ Saved' : '♡ Save'}</button>
              <button onClick={() => shareQuote(dailyQuote)} style={{ background: currentTheme.cardBg, border: `1px solid ${currentTheme.border}`, color: currentTheme.textMuted, padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>↗ Share</button>
            </div>
          </main>
        )}

        {/* Filter View */}
        {view === 'filter' && (
          <main style={{ position: 'absolute', top: '80px', left: 0, right: 0, bottom: 0, zIndex: 2, padding: '2rem', overflowY: 'auto' }}>
            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
              {/* Schools */}
              <h2 style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: currentTheme.textMuted, marginBottom: '1.5rem', textAlign: 'center' }}>Filter by School of Thought</h2>
              {selectedSchools.size > 0 && (
                <button onClick={() => setSelectedSchools(new Set())} style={{ display: 'block', margin: '0 auto 1.5rem', background: 'none', border: 'none', color: '#E8B4B8', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}>Clear school filters</button>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', marginBottom: '2.5rem' }}>
                {allSchools.map(school => {
                  const isSelected = selectedSchools.has(school);
                  const color = getSchoolColor(school);
                  const count = allQuotes.filter(q => q.school === school).length;
                  return (
                    <button
                      key={school}
                      onClick={() => toggleSchool(school)}
                      style={{
                        background: isSelected ? color + '30' : currentTheme.cardBg,
                        border: '1px solid',
                        borderColor: isSelected ? color : currentTheme.border,
                        color: isSelected ? color : currentTheme.textMuted,
                        padding: '0.6rem 1rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      {school}<span style={{ fontSize: '0.65rem', opacity: 0.6 }}>{count}</span>
                    </button>
                  );
                })}
              </div>

              {/* Themes/Categories */}
              <h2 style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: currentTheme.textMuted, marginBottom: '1.5rem', textAlign: 'center' }}>Filter by Theme</h2>
              {selectedThemes.size > 0 && (
                <button onClick={() => setSelectedThemes(new Set())} style={{ display: 'block', margin: '0 auto 1.5rem', background: 'none', border: 'none', color: '#E8B4B8', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}>Clear theme filters</button>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
                {allThemes.map(theme => {
                  const isSelected = selectedThemes.has(theme);
                  const color = getThemeColor(theme);
                  const count = allQuotes.filter(q => q.themes && q.themes.includes(theme)).length;
                  return (
                    <button
                      key={theme}
                      onClick={() => toggleTheme(theme)}
                      style={{
                        background: isSelected ? color + '25' : currentTheme.cardBg,
                        border: '1px solid',
                        borderColor: isSelected ? color : currentTheme.border,
                        color: isSelected ? color : currentTheme.textMuted,
                        padding: '0.5rem 0.9rem',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        textTransform: 'lowercase',
                      }}
                    >
                      {theme}<span style={{ fontSize: '0.6rem', opacity: 0.6 }}>{count}</span>
                    </button>
                  );
                })}
              </div>

              <div style={{ marginTop: '2rem', textAlign: 'center', color: currentTheme.textMuted, fontSize: '0.8rem' }}>
                {filteredQuotes.length} quotes match your filters
              </div>
              <button
                onClick={() => setView('scroll')}
                style={{
                  display: 'block',
                  margin: '2rem auto 0',
                  background: `${currentTheme.text}15`,
                  border: `1px solid ${currentTheme.border}`,
                  color: currentTheme.text,
                  padding: '0.85rem 2rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                Start Scrolling →
              </button>
            </div>
          </main>
        )}

        {/* Saved View */}
        {view === 'saved' && (
          <main style={{ position: 'absolute', top: '80px', left: 0, right: 0, bottom: 0, zIndex: 2, padding: '2rem', overflowY: 'auto' }}>
            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
              <h2 style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: currentTheme.textMuted, marginBottom: '2rem', textAlign: 'center' }}>
                {savedQuotes.length === 0 ? 'No saved quotes yet' : savedQuotes.length + ' Saved Quote' + (savedQuotes.length === 1 ? '' : 's')}
              </h2>
              {savedQuotes.length === 0 && (
                <p style={{ textAlign: 'center', color: currentTheme.textMuted, fontSize: '0.9rem' }}>Tap the heart on any quote to save it here.</p>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {savedQuotes.map((quote, i) => (
                  <div key={i} style={{ padding: '1.5rem', background: currentTheme.cardBg, borderRadius: '12px', border: `1px solid ${currentTheme.border}` }}>
                    <blockquote style={{ fontSize: '1.1rem', fontFamily: '"Cormorant Garamond", Georgia, serif', fontStyle: 'italic', lineHeight: 1.6, color: currentTheme.text, margin: 0 }}>"{quote.text}"</blockquote>
                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: currentTheme.textMuted, fontWeight: 500 }}>{quote.author}</div>
                        <span style={{ display: 'inline-block', marginTop: '0.35rem', padding: '0.2rem 0.5rem', background: getSchoolColor(quote.school) + '15', borderRadius: '3px', color: getSchoolColor(quote.school), fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{quote.school}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => shareQuote(quote)} style={{ background: 'none', border: `1px solid ${currentTheme.border}`, color: currentTheme.textMuted, padding: '0.4rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>↗</button>
                        <button onClick={() => toggleSave(quote)} style={{ background: 'none', border: `1px solid ${currentTheme.border}`, color: '#E8B4B8', padding: '0.4rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>✕</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        )}

        {/* Toast */}
        {toast && (
          <div style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: `${currentTheme.text}15`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${currentTheme.border}`,
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            color: currentTheme.text,
            fontSize: '0.85rem',
            zIndex: 200,
            animation: 'fadeIn 0.3s ease',
          }}>
            {toast}
          </div>
        )}

        {/* Styles */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Jost:wght@300;400;500&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
          html, body { overflow: hidden; }
          ::selection { background: rgba(232, 180, 184, 0.3); }
          @keyframes twinkle { 0%, 100% { opacity: 0.1; } 50% { opacity: 0.5; } }
          @keyframes scrollPulse { 0%, 100% { opacity: 0.4; transform: scaleY(1); } 50% { opacity: 0.8; transform: scaleY(1.2); } }
          @keyframes fadeIn { from { opacity: 0; transform: translate(-50%, 10px); } to { opacity: 1; transform: translate(-50%, 0); } }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.3); border-radius: 2px; }
          @media (max-width: 480px) { .nav-label { display: none; } }
          button:hover { filter: brightness(1.1); }
          input[type="range"] {
            -webkit-appearance: none;
            height: 4px;
            border-radius: 2px;
            background: rgba(128,128,128,0.3);
          }
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #E8E6E3;
            cursor: pointer;
          }
        `}</style>
      </div>
    </ThemeContext.Provider>
  );
}

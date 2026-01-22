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
    bg: '#000',
    text: '#E8E4DC',
    textMuted: '#7a7570',
    accent: '#7FDBCA',
    cardBg: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.1)',
  },
  cosmos: {
    name: 'Cosmos',
    bg: '#000',
    text: '#E4E0E8',
    textMuted: '#8080A0',
    accent: '#7FDBCA',
    cardBg: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.1)',
  },
  dawn: {
    name: 'Dawn',
    bg: '#000',
    text: '#E8E4DC',
    textMuted: '#7a7570',
    accent: '#7FDBCA',
    cardBg: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.1)',
  },
  ink: {
    name: 'Ink',
    bg: '#000',
    text: '#E8E4E0',       // Warm off-white
    textMuted: '#5a5854',
    accent: '#D0CCC4',
    cardBg: 'rgba(255,248,240,0.02)',
    border: 'rgba(255,248,240,0.06)',
  },
};

const ThemeContext = createContext(themes.void);

// ============================================================================
// BREATHWORK TECHNIQUES
// ============================================================================

const breathTechniques = {
  calm: {
    name: 'Gentle Calm',
    description: 'Simple, soothing rhythm',
    phases: [
      { name: 'inhale', label: 'Breathe in', duration: 5 },
      { name: 'exhale', label: 'Breathe out', duration: 6 },
    ],
    color: { inhale: '#1a3a4a', exhale: '#2a3a4a' },
  },
  relaxation: {
    name: '4-7-8 Sleep',
    description: 'Deep relaxation for sleep',
    phases: [
      { name: 'inhale', label: 'Inhale', duration: 4 },
      { name: 'holdFull', label: 'Hold', duration: 7 },
      { name: 'exhale', label: 'Exhale', duration: 8 },
    ],
    color: { inhale: '#1a3a5a', holdFull: '#3a4a4a', exhale: '#2a2a4a' },
  },
  coherent: {
    name: 'Heart Coherence',
    description: '5 breaths per minute',
    phases: [
      { name: 'inhale', label: 'Inhale', duration: 6 },
      { name: 'exhale', label: 'Exhale', duration: 6 },
    ],
    color: { inhale: '#1a4a4a', exhale: '#2a3a5a' },
  },
  box: {
    name: 'Box Breathing',
    description: 'Navy SEAL calm focus',
    phases: [
      { name: 'inhale', label: 'Inhale', duration: 4 },
      { name: 'holdFull', label: 'Hold', duration: 4 },
      { name: 'exhale', label: 'Exhale', duration: 4 },
      { name: 'holdEmpty', label: 'Hold', duration: 4 },
    ],
    color: { inhale: '#1a3a4a', holdFull: '#2a4a3a', exhale: '#2a3a4a', holdEmpty: '#1a2a3a' },
  },
  extended: {
    name: 'Extended Exhale',
    description: 'Long exhale activates rest',
    phases: [
      { name: 'inhale', label: 'Inhale', duration: 4 },
      { name: 'exhale', label: 'Exhale slowly', duration: 8 },
    ],
    color: { inhale: '#1a3a4a', exhale: '#2a2a4a' },
  },
  ocean: {
    name: 'Ocean Breath',
    description: 'Slow, wave-like rhythm',
    phases: [
      { name: 'inhale', label: 'Inhale', duration: 6 },
      { name: 'holdFull', label: 'Pause', duration: 2 },
      { name: 'exhale', label: 'Exhale', duration: 8 },
      { name: 'holdEmpty', label: 'Rest', duration: 2 },
    ],
    color: { inhale: '#1a3a5a', holdFull: '#2a4a5a', exhale: '#1a2a4a', holdEmpty: '#1a2a3a' },
  },
  resonance: {
    name: 'Resonance',
    description: 'Syncs heart and breath',
    phases: [
      { name: 'inhale', label: 'Inhale', duration: 5 },
      { name: 'exhale', label: 'Exhale', duration: 5 },
    ],
    color: { inhale: '#2a3a4a', exhale: '#1a3a4a' },
  },
};

// ============================================================================
// GAZE MODE - Nervous System Regulation Tool
// Based on scientific research: fractals, bilateral stimulation, breath sync
// ============================================================================

// Organized by energy level for nervous system regulation
const gazeModes = [
  { key: 'geometry', name: 'Torus' },
  { key: 'tree', name: 'Fractal Tree' },
  { key: 'fern', name: 'Fern' },
  { key: 'succulent', name: 'Succulent' },
  { key: 'coral', name: 'Coral' },
  { key: 'mycelium', name: 'Mycelium' },
  { key: 'dandelion', name: 'Dandelion' },
  { key: 'blossom', name: 'Cherry Blossom' },
  { key: 'lungs', name: 'Breath Tree' },
  { key: 'bilateral', name: 'Bilateral' },
  { key: 'ripples', name: 'Ripples' },
  { key: 'glow', name: 'Soft Glow' },
  { key: 'rain', name: 'Rain on Glass' },
  { key: 'jellyfish', name: 'Jellyfish' },
  { key: 'ink', name: 'Ink in Water' },
  { key: 'fireflies', name: 'Fireflies' },
];

// Curated experiences - one decision instead of two
// Each pairs a visual with an ideal breathing pattern
const gazeExperiences = [
  { key: 'deep-sleep', name: 'Deep Sleep', visual: 'jellyfish', breath: 'relaxation', description: 'Drift off peacefully' },
  { key: 'storm-watch', name: 'Storm Watch', visual: 'rain', breath: 'extend', description: 'Release anxiety' },
  { key: 'night-walk', name: 'Night Walk', visual: 'fireflies', breath: 'resonance', description: 'Evening calm' },
  { key: 'ocean-mind', name: 'Ocean Mind', visual: 'ink', breath: 'ocean', description: 'Fluid meditation' },
  { key: 'focus', name: 'Focus', visual: 'geometry', breath: 'box', description: 'Sharp clarity' },
  { key: 'forest-floor', name: 'Forest Floor', visual: 'mycelium', breath: 'extend', description: 'Grounded presence' },
  { key: 'spring-bloom', name: 'Spring Bloom', visual: 'blossom', breath: 'resonance', description: 'Gentle renewal' },
  { key: 'breathe-deep', name: 'Breathe Deep', visual: 'lungs', breath: 'relaxation', description: 'Guided breath' },
  { key: 'coral-reef', name: 'Coral Reef', visual: 'coral', breath: 'ocean', description: 'Underwater peace' },
  { key: 'ripple-effect', name: 'Ripple Effect', visual: 'ripples', breath: 'resonance', description: 'Radiating calm' },
  { key: 'slow-unfurl', name: 'Slow Unfurl', visual: 'fern', breath: 'extend', description: 'Patient growth' },
  { key: 'desert-calm', name: 'Desert Calm', visual: 'succulent', breath: 'coherent', description: 'Quiet resilience' },
  { key: 'make-a-wish', name: 'Make a Wish', visual: 'dandelion', breath: 'calm', description: 'Lightness of being' },
  { key: 'growing', name: 'Growing', visual: 'tree', breath: 'calm', description: 'Organic expansion' },
  { key: 'balance', name: 'Balance', visual: 'bilateral', breath: 'box', description: 'Centered focus' },
];

const gazeShapes = [
  { key: 'torus', name: 'Torus', create: () => new THREE.TorusGeometry(1, 0.4, 16, 100) },
  { key: 'torusKnot', name: 'Knot', create: () => new THREE.TorusKnotGeometry(0.7, 0.25, 100, 16) },
];

// Breath cycle: 5s inhale, 6s exhale = ~5.5 breaths/min (parasympathetic optimal)
const BREATH_CYCLE = 11; // seconds for full cycle
const BREATH_SPEED = (2 * Math.PI) / BREATH_CYCLE;

function GazeMode({ theme }) {
  const containerRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const frameRef = React.useRef(null);
  const sceneRef = React.useRef(null);
  const rendererRef = React.useRef(null);
  const meshRef = React.useRef(null);
  const clockRef = React.useRef(null);

  const [currentMode, setCurrentMode] = React.useState('jellyfish');
  const [currentShape, setCurrentShape] = React.useState('torus');
  const [showUI, setShowUI] = React.useState(false);
  const [selectedTechnique, setSelectedTechnique] = React.useState('relaxation');
  const [selectedExperience, setSelectedExperience] = React.useState('deep-sleep');
  const [customMode, setCustomMode] = React.useState(false);
  const [showExperienceToast, setShowExperienceToast] = React.useState(false);
  const toastTimeoutRef = React.useRef(null);

  // When experience changes, update visual and breath
  const selectExperience = React.useCallback((expKey, showToast = false) => {
    const exp = gazeExperiences.find(e => e.key === expKey);
    if (exp) {
      setSelectedExperience(expKey);
      setCurrentMode(exp.visual);
      setSelectedTechnique(exp.breath);
      setCustomMode(false);

      // Show toast when swiping
      if (showToast) {
        setShowExperienceToast(true);
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => setShowExperienceToast(false), 1500);
      }
    }
  }, []);

  // Breath session state for technique-based breathing
  const breathSessionRef = React.useRef({
    startTime: Date.now(),
    phaseIndex: 0,
    phaseStartTime: Date.now(),
  });

  // State for breath indicator display
  const [breathDisplay, setBreathDisplay] = React.useState({ phase: 0.5, phaseLabel: 'Breathe in', isHolding: false });

  // ========== TOUCH INTERACTION SYSTEM ==========
  const touchPointsRef = React.useRef([]);
  const ripplesRef = React.useRef([]);
  const swipeStartRef = React.useRef(null);

  // Cycle to next/previous experience
  const cycleExperience = React.useCallback((direction) => {
    if (customMode) return;
    const currentIndex = gazeExperiences.findIndex(e => e.key === selectedExperience);
    let newIndex;
    if (direction > 0) {
      newIndex = (currentIndex + 1) % gazeExperiences.length;
    } else {
      newIndex = (currentIndex - 1 + gazeExperiences.length) % gazeExperiences.length;
    }
    selectExperience(gazeExperiences[newIndex].key, true); // Show toast on swipe
  }, [customMode, selectedExperience, selectExperience]);

  // Track touch/mouse positions with spring physics
  const handleInteractionStart = React.useCallback((e) => {
    if (showUI) return;
    e.preventDefault();
    const touches = e.touches ? Array.from(e.touches) : [{ clientX: e.clientX, clientY: e.clientY, identifier: 'mouse' }];

    // Track swipe start for first touch
    if (touches.length === 1) {
      swipeStartRef.current = { x: touches[0].clientX, y: touches[0].clientY, time: Date.now() };
    }

    touches.forEach(touch => {
      const existing = touchPointsRef.current.find(p => p.id === touch.identifier);
      if (!existing) {
        touchPointsRef.current.push({
          id: touch.identifier,
          x: touch.clientX,
          y: touch.clientY,
          startX: touch.clientX,
          startY: touch.clientY,
          velocity: { x: 0, y: 0 },
          active: true,
          startTime: Date.now(),
        });
        // Create ripple
        ripplesRef.current.push({
          x: touch.clientX,
          y: touch.clientY,
          startTime: Date.now(),
          maxRadius: 150,
          duration: 1000,
        });
      }
    });
  }, [showUI]);

  const handleInteractionMove = React.useCallback((e) => {
    if (showUI) return;
    const touches = e.touches ? Array.from(e.touches) : [{ clientX: e.clientX, clientY: e.clientY, identifier: 'mouse' }];
    touches.forEach(touch => {
      const point = touchPointsRef.current.find(p => p.id === touch.identifier);
      if (point) {
        point.velocity.x = touch.clientX - point.x;
        point.velocity.y = touch.clientY - point.y;
        point.x = touch.clientX;
        point.y = touch.clientY;
      }
    });
  }, [showUI]);

  const handleInteractionEnd = React.useCallback((e) => {
    const touches = e.changedTouches ? Array.from(e.changedTouches) : [{ identifier: 'mouse', clientX: e.clientX, clientY: e.clientY }];

    // Check for swipe gesture
    if (swipeStartRef.current && touches.length === 1) {
      const endX = touches[0].clientX;
      const endY = touches[0].clientY;
      const deltaX = endX - swipeStartRef.current.x;
      const deltaY = endY - swipeStartRef.current.y;
      const deltaTime = Date.now() - swipeStartRef.current.time;

      // Detect horizontal swipe: fast enough, long enough, more horizontal than vertical
      const minSwipeDistance = 60;
      const maxSwipeTime = 400;
      if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaX) > Math.abs(deltaY) * 1.5 && deltaTime < maxSwipeTime) {
        cycleExperience(deltaX > 0 ? -1 : 1); // Swipe left = next, swipe right = previous
      }
      swipeStartRef.current = null;
    }

    touches.forEach(touch => {
      const point = touchPointsRef.current.find(p => p.id === touch.identifier);
      if (point) {
        point.active = false;
        point.endTime = Date.now();
      }
    });
    // Clean up old inactive points after decay
    setTimeout(() => {
      touchPointsRef.current = touchPointsRef.current.filter(p => p.active || Date.now() - p.endTime < 2000);
    }, 2000);
  }, [cycleExperience]);

  // Helper: Calculate influence of touch points on a position
  const getInteractionInfluence = React.useCallback((x, y, maxRadius = 200) => {
    let totalInfluence = { x: 0, y: 0, strength: 0 };
    const now = Date.now();

    touchPointsRef.current.forEach(point => {
      const dx = x - point.x;
      const dy = y - point.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < maxRadius) {
        // Decay strength over time after release
        let strength = 1 - dist / maxRadius;
        if (!point.active) {
          const decay = Math.max(0, 1 - (now - point.endTime) / 1500);
          strength *= decay;
        }
        // Spring-like influence (push away slightly, then pull)
        const angle = Math.atan2(dy, dx);
        totalInfluence.x += Math.cos(angle) * strength * 30;
        totalInfluence.y += Math.sin(angle) * strength * 30;
        totalInfluence.strength = Math.max(totalInfluence.strength, strength);
      }
    });

    return totalInfluence;
  }, []);

  // Helper: Draw ripples on canvas
  const drawRipples = React.useCallback((ctx) => {
    const now = Date.now();
    ripplesRef.current = ripplesRef.current.filter(ripple => {
      const age = now - ripple.startTime;
      if (age > ripple.duration) return false;

      const progress = age / ripple.duration;
      const radius = ripple.maxRadius * progress;
      const opacity = (1 - progress) * 0.4;

      ctx.beginPath();
      ctx.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(127, 219, 202, ${opacity})`;
      ctx.lineWidth = 2 * (1 - progress);
      ctx.stroke();

      return true;
    });
  }, []);

  // Get breath info based on selected technique
  const getBreathInfo = React.useCallback((elapsed) => {
    const technique = breathTechniques[selectedTechnique];
    if (!technique) {
      const phase = Math.sin(elapsed * BREATH_SPEED) * 0.5 + 0.5;
      return { phase, phaseName: phase > 0.5 ? 'inhale' : 'exhale', phaseLabel: phase > 0.5 ? 'Breathe in' : 'Breathe out', isInhaling: phase > 0.5 };
    }

    const phases = technique.phases;
    const totalCycleDuration = phases.reduce((sum, p) => sum + p.duration, 0);
    const cycleTime = elapsed % totalCycleDuration;

    let accumulatedTime = 0;
    for (let i = 0; i < phases.length; i++) {
      const p = phases[i];
      if (cycleTime < accumulatedTime + p.duration) {
        const phaseProgress = (cycleTime - accumulatedTime) / p.duration;
        const isInhaling = p.name === 'inhale';
        const isHolding = p.name === 'holdFull' || p.name === 'holdEmpty';

        // Calculate visual phase (0-1) based on breath state
        let visualPhase;
        if (p.name === 'inhale') {
          visualPhase = phaseProgress;
        } else if (p.name === 'holdFull') {
          visualPhase = 1;
        } else if (p.name === 'exhale') {
          visualPhase = 1 - phaseProgress;
        } else {
          visualPhase = 0;
        }

        return { phase: visualPhase, phaseName: p.name, phaseLabel: p.label, isInhaling, isHolding, phaseProgress };
      }
      accumulatedTime += p.duration;
    }
    return { phase: 0.5, phaseName: 'inhale', phaseLabel: 'Breathe in', isInhaling: true };
  }, [selectedTechnique]);

  // Simple phase getter for visuals (returns 0-1)
  const getBreathPhase = React.useCallback((elapsed) => {
    return getBreathInfo(elapsed).phase;
  }, [getBreathInfo]);

  // Update breath display for indicator
  React.useEffect(() => {
    const startTime = Date.now();
    let animFrame;
    const updateBreathDisplay = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const info = getBreathInfo(elapsed);
      setBreathDisplay({ phase: info.phase, phaseLabel: info.phaseLabel, isHolding: info.isHolding || false });
      animFrame = requestAnimationFrame(updateBreathDisplay);
    };
    updateBreathDisplay();
    return () => cancelAnimationFrame(animFrame);
  }, [getBreathInfo]);

  // ========== SACRED GEOMETRY MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'geometry' || !containerRef.current || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 4;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    clockRef.current = new THREE.Clock();

    const shapeConfig = gazeShapes.find(s => s.key === currentShape) || gazeShapes[0];
    const geometry = shapeConfig.create();
    const material = new THREE.MeshBasicMaterial({ color: 0x7FDBCA, wireframe: true, transparent: true, opacity: 0.8 });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = clockRef.current.getElapsedTime();
      const breath = getBreathPhase(elapsed);

      if (meshRef.current) {
        // Base rotation
        meshRef.current.rotation.y += 0.001;
        meshRef.current.rotation.x += 0.0005;

        // Touch influence - rotate toward touch points
        if (touchPointsRef.current.length > 0) {
          const activeTouch = touchPointsRef.current.find(p => p.active) || touchPointsRef.current[0];
          if (activeTouch) {
            const normalizedX = (activeTouch.x / window.innerWidth - 0.5) * 2;
            const normalizedY = (activeTouch.y / window.innerHeight - 0.5) * 2;
            meshRef.current.rotation.y += normalizedX * 0.02;
            meshRef.current.rotation.x += normalizedY * 0.02;
          }
        }

        meshRef.current.scale.setScalar(0.8 + breath * 0.4);
        meshRef.current.material.opacity = 0.5 + breath * 0.3;
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (rendererRef.current && containerRef.current && containerRef.current.contains(rendererRef.current.domElement)) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [currentMode, currentShape]);

  // ========== FRACTAL TREE MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'tree' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    const drawBranch = (x, y, len, angle, depth, breath, time, getInfluence) => {
      if (depth === 0 || len < 4) return;

      // Sway with breath and time
      const sway = Math.sin(time * 0.5 + depth * 0.5) * 0.05 * breath;

      // Touch influence - branches bend away from touch
      const influence = getInfluence(x, y, 250);
      const touchSway = influence.strength > 0 ? Math.atan2(influence.y, influence.x) * influence.strength * 0.3 : 0;
      const newAngle = angle + sway + touchSway;

      const x2 = x + Math.cos(newAngle) * len;
      const y2 = y + Math.sin(newAngle) * len;

      // Color gradient: warm brown at base to teal at tips
      const t = 1 - depth / 8;
      const r = Math.floor(80 + t * 47);
      const g = Math.floor(60 + t * 159);
      const b = Math.floor(50 + t * 152);

      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.4 + breath * 0.4})`;
      ctx.lineWidth = depth * 0.8;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Branch factor varies with breath
      const branchAngle = 0.4 + breath * 0.2;
      const lenFactor = 0.67 + breath * 0.08;

      drawBranch(x2, y2, len * lenFactor, newAngle - branchAngle, depth - 1, breath, time, getInfluence);
      drawBranch(x2, y2, len * lenFactor, newAngle + branchAngle, depth - 1, breath, time, getInfluence);
    };

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = (Date.now() - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const baseY = canvas.height * 0.85;
      const trunkLen = canvas.height * 0.18;

      drawBranch(centerX, baseY, trunkLen, -Math.PI / 2, 8, breath, elapsed, getInteractionInfluence);

      // Draw touch ripples
      drawRipples(ctx);
    };

    // Initial clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [currentMode, getInteractionInfluence, drawRipples]);

  // ========== BILATERAL FLOW MODE (EMDR-style) ==========
  React.useEffect(() => {
    if (currentMode !== 'bilateral' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = (Date.now() - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      // Clear with fade for trails
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerY = canvas.height / 2;
      const amplitude = canvas.width * 0.35;

      // Slow left-right oscillation (4 second cycle for EMDR)
      const x = canvas.width / 2 + Math.sin(elapsed * 0.8) * amplitude;

      // Main orb
      const radius = 30 + breath * 20;
      const gradient = ctx.createRadialGradient(x, centerY, 0, x, centerY, radius * 2);
      gradient.addColorStop(0, `rgba(127, 219, 202, ${0.6 + breath * 0.3})`);
      gradient.addColorStop(0.5, `rgba(127, 219, 202, ${0.2 + breath * 0.2})`);
      gradient.addColorStop(1, 'rgba(127, 219, 202, 0)');

      ctx.beginPath();
      ctx.arc(x, centerY, radius * 2, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Inner bright core
      ctx.beginPath();
      ctx.arc(x, centerY, radius * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 240, 230, ${0.5 + breath * 0.4})`;
      ctx.fill();

      // Trailing glow points
      for (let i = 1; i <= 5; i++) {
        const trailX = canvas.width / 2 + Math.sin(elapsed * 0.8 - i * 0.15) * amplitude;
        const trailRadius = (radius * 0.3) / i;
        ctx.beginPath();
        ctx.arc(trailX, centerY, trailRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(127, 219, 202, ${0.15 / i})`;
        ctx.fill();
      }

      // Draw touch ripples
      drawRipples(ctx);
    };

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [currentMode, drawRipples]);

  // ========== RIPPLES MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'ripples' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();
    const ripples = [];

    // Create new ripple on breath cycle
    let lastBreathPeak = 0;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = (Date.now() - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      // Spawn ripple at breath peak
      if (breath > 0.95 && elapsed - lastBreathPeak > BREATH_CYCLE * 0.8) {
        ripples.push({ born: elapsed, x: canvas.width / 2, y: canvas.height / 2 });
        lastBreathPeak = elapsed;
      }

      // Spawn ripples at touch points
      touchPointsRef.current.forEach(point => {
        if (point.active && !point.rippleSpawned) {
          ripples.push({ born: elapsed, x: point.x, y: point.y });
          point.rippleSpawned = true;
        }
      });

      // Clear
      ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Draw expanding ripples
      ripples.forEach((ripple, i) => {
        const age = elapsed - ripple.born;
        const maxAge = 15;
        if (age > maxAge) {
          ripples.splice(i, 1);
          return;
        }

        const progress = age / maxAge;
        const radius = progress * Math.min(canvas.width, canvas.height) * 0.6;
        const opacity = (1 - progress) * 0.5;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(127, 219, 202, ${opacity})`;
        ctx.lineWidth = 2 - progress;
        ctx.stroke();
      });

      // Central breathing orb - responds to touch
      const centerInfluence = getInteractionInfluence(centerX, centerY, 200);
      const coreRadius = 20 + breath * 30 + centerInfluence.strength * 20;
      const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius * 2);
      coreGradient.addColorStop(0, `rgba(127, 219, 202, ${0.4 + breath * 0.3 + centerInfluence.strength * 0.3})`);
      coreGradient.addColorStop(0.5, `rgba(100, 180, 170, ${0.2 + breath * 0.1})`);
      coreGradient.addColorStop(1, 'rgba(80, 150, 140, 0)');

      ctx.beginPath();
      ctx.arc(centerX + centerInfluence.x * 0.2, centerY + centerInfluence.y * 0.2, coreRadius * 2, 0, Math.PI * 2);
      ctx.fillStyle = coreGradient;
      ctx.fill();

      // Draw touch ripples
      drawRipples(ctx);
    };

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ripples.push({ born: 0, x: canvas.width / 2, y: canvas.height / 2 });
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [currentMode, getInteractionInfluence, drawRipples]);

  // ========== SOFT GLOW MODE (Peripheral Vision) ==========
  React.useEffect(() => {
    if (currentMode !== 'glow' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    const orbs = [
      { x: 0.3, y: 0.4, phase: 0 },
      { x: 0.7, y: 0.4, phase: Math.PI },
      { x: 0.5, y: 0.6, phase: Math.PI / 2 },
    ];

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = (Date.now() - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      // Soft fade clear
      ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      orbs.forEach(orb => {
        const orbBreath = getBreathPhase(elapsed + orb.phase);
        let x = orb.x * canvas.width + Math.sin(elapsed * 0.1 + orb.phase) * 30;
        let y = orb.y * canvas.height + Math.cos(elapsed * 0.08 + orb.phase) * 20;

        // Touch influence - orbs are attracted/repelled
        const influence = getInteractionInfluence(x, y, 250);
        x += influence.x * 0.3;
        y += influence.y * 0.3;

        const radius = 80 + orbBreath * 60 + influence.strength * 30;

        // Very soft, defocused glow - brighter when touched
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 3);
        gradient.addColorStop(0, `rgba(127, 219, 202, ${0.15 + orbBreath * 0.1 + influence.strength * 0.2})`);
        gradient.addColorStop(0.3, `rgba(100, 180, 170, ${0.08 + orbBreath * 0.05 + influence.strength * 0.1})`);
        gradient.addColorStop(0.6, `rgba(80, 150, 140, ${0.03 + influence.strength * 0.05})`);
        gradient.addColorStop(1, 'rgba(60, 120, 110, 0)');

        ctx.beginPath();
        ctx.arc(x, y, radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      // Central gentle pulse with touch response
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const centerInfluence = getInteractionInfluence(centerX, centerY, 200);
      const centerRadius = 40 + breath * 30 + centerInfluence.strength * 20;
      const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, centerRadius * 2);
      centerGradient.addColorStop(0, `rgba(200, 240, 230, ${0.1 + breath * 0.08 + centerInfluence.strength * 0.15})`);
      centerGradient.addColorStop(1, 'rgba(127, 219, 202, 0)');

      ctx.beginPath();
      ctx.arc(centerX + centerInfluence.x * 0.1, centerY + centerInfluence.y * 0.1, centerRadius * 2, 0, Math.PI * 2);
      ctx.fillStyle = centerGradient;
      ctx.fill();

      // Draw touch ripples
      drawRipples(ctx);
    };

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [currentMode, getInteractionInfluence, drawRipples]);

  // ========== FERN MODE (Barnsley Fern) ==========
  React.useEffect(() => {
    if (currentMode !== 'fern' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    // Barnsley fern transformation matrices
    const transforms = [
      { a: 0, b: 0, c: 0, d: 0.16, e: 0, f: 0, p: 0.01 },
      { a: 0.85, b: 0.04, c: -0.04, d: 0.85, e: 0, f: 1.6, p: 0.85 },
      { a: 0.2, b: -0.26, c: 0.23, d: 0.22, e: 0, f: 1.6, p: 0.07 },
      { a: -0.15, b: 0.28, c: 0.26, d: 0.24, e: 0, f: 0.44, p: 0.07 },
    ];

    const fernPoints = [];
    let x = 0, y = 0;

    // Pre-calculate fern points
    for (let i = 0; i < 50000; i++) {
      const r = Math.random();
      let t;
      if (r < transforms[0].p) t = transforms[0];
      else if (r < transforms[0].p + transforms[1].p) t = transforms[1];
      else if (r < transforms[0].p + transforms[1].p + transforms[2].p) t = transforms[2];
      else t = transforms[3];

      const nx = t.a * x + t.b * y + t.e;
      const ny = t.c * x + t.d * y + t.f;
      x = nx; y = ny;
      fernPoints.push({ x, y });
    }

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = (Date.now() - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const scale = canvas.height / 12;
      const offsetX = canvas.width / 2;
      const offsetY = canvas.height * 0.95;

      // Sway with breath
      const sway = Math.sin(elapsed * 0.3) * 15 * breath;

      // Draw fern points with gradient
      const pointsToDraw = Math.floor(fernPoints.length * (0.3 + breath * 0.7));
      for (let i = 0; i < pointsToDraw; i++) {
        const p = fernPoints[i];
        let px = offsetX + p.x * scale + sway * (p.y / 10);
        let py = offsetY - p.y * scale;

        // Touch influence - fronds curl inward toward touch
        const influence = getInteractionInfluence(px, py, 200);
        if (influence.strength > 0) {
          px += influence.x * 0.5;
          py += influence.y * 0.5;
        }

        // Color gradient from stem to tips
        const t = p.y / 10;
        const r = Math.floor(60 + t * 67);
        const g = Math.floor(100 + t * 119);
        const b = Math.floor(80 + t * 122);

        const glowBoost = influence.strength * 0.3;
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.3 + breath * 0.4 + glowBoost})`;
        ctx.fillRect(px, py, 1.5 + influence.strength, 1.5 + influence.strength);
      }

      // Draw touch ripples
      drawRipples(ctx);
    };

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    animate();

    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [currentMode, getInteractionInfluence, drawRipples]);

  // ========== DANDELION MODE (Breath-synced seed release) ==========
  React.useEffect(() => {
    if (currentMode !== 'dandelion' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    // Seeds still attached
    const seedCount = 60;
    const seeds = [];
    for (let i = 0; i < seedCount; i++) {
      const angle = (i / seedCount) * Math.PI * 2;
      const layer = Math.floor(i / 20);
      seeds.push({
        angle,
        layer,
        length: 40 + layer * 15,
        attached: true,
        x: 0, y: 0, vx: 0, vy: 0,
      });
    }

    // Floating seeds (detached)
    const floatingSeeds = [];
    let lastExhale = 0;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = (Date.now() - startTime) / 1000;
      const breath = getBreathPhase(elapsed);
      const isExhaling = breath < 0.5 && elapsed > 1;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const coreRadius = 15;

      // Release seeds on exhale
      if (isExhaling && elapsed - lastExhale > 2 && seeds.some(s => s.attached)) {
        const toRelease = seeds.filter(s => s.attached).slice(0, 3);
        toRelease.forEach(seed => {
          seed.attached = false;
          const angle = seed.angle + Math.sin(elapsed) * 0.2;
          seed.x = centerX + Math.cos(angle) * seed.length;
          seed.y = centerY + Math.sin(angle) * seed.length;
          seed.vx = (Math.random() - 0.5) * 0.5;
          seed.vy = -Math.random() * 0.8 - 0.3;
          floatingSeeds.push(seed);
        });
        lastExhale = elapsed;
      }

      // Draw stem
      ctx.strokeStyle = 'rgba(100, 140, 100, 0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX, canvas.height);
      ctx.stroke();

      // Draw core (seed head)
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(180, 160, 120, 0.8)';
      ctx.fill();

      // Draw attached seeds and check for touch release
      seeds.filter(s => s.attached).forEach(seed => {
        const sway = Math.sin(elapsed * 0.5 + seed.angle) * 0.1;
        const angle = seed.angle + sway;
        const x = centerX + Math.cos(angle) * seed.length;
        const y = centerY + Math.sin(angle) * seed.length;

        // Touch influence - release seeds when touched
        const influence = getInteractionInfluence(x, y, 80);
        if (influence.strength > 0.5 && seed.attached) {
          seed.attached = false;
          seed.x = x;
          seed.y = y;
          // Launch in direction away from touch
          seed.vx = (influence.x / 30) + (Math.random() - 0.5) * 0.5;
          seed.vy = -Math.random() * 1.5 - 0.5 + (influence.y / 30);
          floatingSeeds.push(seed);
        }

        // Pappus (fluffy part)
        const glowBoost = influence.strength * 0.4;
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + breath * 0.3 + glowBoost})`;
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 8; i++) {
          const fAngle = (i / 8) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.cos(fAngle) * 8, y + Math.sin(fAngle) * 8);
          ctx.stroke();
        }

        // Stem to seed
        ctx.strokeStyle = 'rgba(200, 200, 180, 0.4)';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
      });

      // Update and draw floating seeds
      floatingSeeds.forEach((seed, i) => {
        seed.x += seed.vx + Math.sin(elapsed + i) * 0.2;
        seed.y += seed.vy;
        seed.vy -= 0.002; // Gentle upward drift

        // Draw floating seed
        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0, 0.5 - Math.abs(seed.y - centerY) / canvas.height)})`;
        ctx.lineWidth = 0.5;
        for (let j = 0; j < 6; j++) {
          const fAngle = (j / 6) * Math.PI * 2 + elapsed * 0.5;
          ctx.beginPath();
          ctx.moveTo(seed.x, seed.y);
          ctx.lineTo(seed.x + Math.cos(fAngle) * 6, seed.y + Math.sin(fAngle) * 6);
          ctx.stroke();
        }
      });

      // Remove seeds that float off screen
      for (let i = floatingSeeds.length - 1; i >= 0; i--) {
        if (floatingSeeds[i].y < -50) floatingSeeds.splice(i, 1);
      }

      // Draw touch ripples
      drawRipples(ctx);
    };

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    animate();

    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [currentMode, getInteractionInfluence, drawRipples]);

  // ========== SUCCULENT SPIRAL (Fibonacci) ==========
  React.useEffect(() => {
    if (currentMode !== 'succulent' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // 137.5 degrees
    const leafCount = 80;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = (Date.now() - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const rotation = elapsed * 0.02;

      for (let i = leafCount; i > 0; i--) {
        const angle = i * goldenAngle + rotation;
        const radius = Math.sqrt(i) * 18 * (0.9 + breath * 0.1);
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        // Touch influence - leaves pulse/glow when touched
        const influence = getInteractionInfluence(x, y, 150);
        const leafSize = (8 + (leafCount - i) * 0.3) * (1 + influence.strength * 0.3);

        // Leaf gradient from center (lighter) to edge (darker teal)
        const t = i / leafCount;
        const r = Math.floor(80 + (1-t) * 47 + influence.strength * 40);
        const g = Math.floor(160 + (1-t) * 59 + influence.strength * 30);
        const b = Math.floor(140 + (1-t) * 62 + influence.strength * 30);

        // Draw leaf shape with touch displacement
        ctx.save();
        ctx.translate(x + influence.x * 0.2, y + influence.y * 0.2);
        ctx.rotate(angle + Math.PI / 2);

        ctx.beginPath();
        ctx.ellipse(0, 0, leafSize * 0.6, leafSize, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.6 + breath * 0.3 + influence.strength * 0.2})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(${r + 30}, ${g + 30}, ${b + 30}, ${0.3 + influence.strength * 0.3})`;
        ctx.lineWidth = 0.5 + influence.strength;
        ctx.stroke();

        ctx.restore();
      }

      // Center dot
      ctx.beginPath();
      ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200, 220, 200, 0.8)';
      ctx.fill();

      // Draw touch ripples
      drawRipples(ctx);
    };

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    animate();

    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [currentMode, getInteractionInfluence, drawRipples]);

  // ========== CORAL MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'coral' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    // Generate coral branches
    const branches = [];
    const generateCoral = (x, y, angle, depth, maxDepth) => {
      if (depth > maxDepth) return;

      const length = 40 - depth * 5 + Math.random() * 20;
      const endX = x + Math.cos(angle) * length;
      const endY = y + Math.sin(angle) * length;

      branches.push({ x1: x, y1: y, x2: endX, y2: endY, depth, maxDepth });

      const branchCount = depth < 2 ? 3 : 2;
      for (let i = 0; i < branchCount; i++) {
        const newAngle = angle + (Math.random() - 0.5) * 1.2;
        generateCoral(endX, endY, newAngle, depth + 1, maxDepth);
      }
    };

    // Create multiple coral structures
    const coralBases = [
      { x: canvas.width * 0.3, maxDepth: 6 },
      { x: canvas.width * 0.5, maxDepth: 7 },
      { x: canvas.width * 0.7, maxDepth: 6 },
    ];

    coralBases.forEach(base => {
      generateCoral(base.x, canvas.height, -Math.PI / 2 + (Math.random() - 0.5) * 0.3, 0, base.maxDepth);
    });

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = (Date.now() - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      ctx.fillStyle = 'rgba(0, 0, 10, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      branches.forEach(branch => {
        // Touch influence - coral bends like water current
        const influence = getInteractionInfluence(branch.x2, branch.y2, 200);

        // Sway like in water + touch influence
        const sway = Math.sin(elapsed * 0.5 + branch.x1 * 0.01) * (branch.depth * 2) * breath + influence.x * 0.5;

        const x1 = branch.x1 + sway * 0.5;
        const y1 = branch.y1;
        const x2 = branch.x2 + sway + influence.x * 0.3;
        const y2 = branch.y2 + influence.y * 0.2;

        // Color: deep purple to teal gradient based on depth, brighter near touch
        const t = branch.depth / branch.maxDepth;
        const r = Math.floor(80 + t * 47 + influence.strength * 30);
        const g = Math.floor(100 + t * 119 + influence.strength * 20);
        const b = Math.floor(120 + t * 82 + influence.strength * 20);

        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.4 + breath * 0.4 + influence.strength * 0.2})`;
        ctx.lineWidth = Math.max(1, 4 - branch.depth * 0.5);
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(
          (x1 + x2) / 2 + sway * 0.3,
          (y1 + y2) / 2,
          x2, y2
        );
        ctx.stroke();

        // Bioluminescent tips - glow brighter when touched
        if (branch.depth === branch.maxDepth) {
          const tipGlow = influence.strength * 0.5;
          ctx.beginPath();
          ctx.arc(x2, y2, 2 + breath * 2 + influence.strength * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(127, 219, 202, ${0.3 + breath * 0.5 + tipGlow})`;
          ctx.fill();
        }
      });

      // Draw touch ripples
      drawRipples(ctx);
    };

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    animate();

    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [currentMode, getInteractionInfluence, drawRipples]);

  // ========== CHERRY BLOSSOM MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'blossom' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    // Generate tree branches
    const branches = [];
    const blossoms = [];

    const generateTree = (x, y, angle, depth, maxDepth) => {
      if (depth > maxDepth) return;

      const length = 80 - depth * 12;
      const endX = x + Math.cos(angle) * length;
      const endY = y + Math.sin(angle) * length;

      branches.push({ x1: x, y1: y, x2: endX, y2: endY, depth });

      // Add blossoms at branch tips
      if (depth >= maxDepth - 2) {
        for (let i = 0; i < 3; i++) {
          blossoms.push({
            x: endX + (Math.random() - 0.5) * 20,
            y: endY + (Math.random() - 0.5) * 20,
            size: 4 + Math.random() * 4,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }

      generateTree(endX, endY, angle - 0.4 - Math.random() * 0.3, depth + 1, maxDepth);
      generateTree(endX, endY, angle + 0.4 + Math.random() * 0.3, depth + 1, maxDepth);
    };

    generateTree(canvas.width / 2, canvas.height, -Math.PI / 2, 0, 6);

    // Falling petals
    const petals = [];
    for (let i = 0; i < 30; i++) {
      petals.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 3 + Math.random() * 3,
        speed: 0.3 + Math.random() * 0.4,
        wobble: Math.random() * Math.PI * 2,
      });
    }

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = (Date.now() - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw branches
      branches.forEach(branch => {
        ctx.strokeStyle = `rgba(60, 40, 30, ${0.6 + breath * 0.2})`;
        ctx.lineWidth = Math.max(1, 8 - branch.depth * 1.2);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(branch.x1, branch.y1);
        ctx.lineTo(branch.x2, branch.y2);
        ctx.stroke();
      });

      // Draw blossoms with touch interaction
      blossoms.forEach(blossom => {
        const influence = getInteractionInfluence(blossom.x, blossom.y, 120);
        const pulse = Math.sin(elapsed * 2 + blossom.phase) * 0.2;
        const size = blossom.size * (1 + pulse) * (0.8 + breath * 0.2) * (1 + influence.strength * 0.3);

        // Pink petals - scatter slightly when touched
        for (let i = 0; i < 5; i++) {
          const angle = (i / 5) * Math.PI * 2 + elapsed * 0.1;
          const scatterDist = influence.strength * 8;
          const px = blossom.x + Math.cos(angle) * (size * 0.5 + scatterDist) + influence.x * 0.2;
          const py = blossom.y + Math.sin(angle) * (size * 0.5 + scatterDist) + influence.y * 0.2;

          ctx.beginPath();
          ctx.ellipse(px, py, size * 0.4, size * 0.6, angle, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, ${200 + influence.strength * 30}, ${210 + influence.strength * 20}, ${0.5 + breath * 0.3 + influence.strength * 0.2})`;
          ctx.fill();
        }

        // Center
        ctx.beginPath();
        ctx.arc(blossom.x + influence.x * 0.1, blossom.y + influence.y * 0.1, size * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 220, 180, ${0.8 + influence.strength * 0.2})`;
        ctx.fill();
      });

      // Update and draw falling petals with touch interaction
      petals.forEach(petal => {
        const influence = getInteractionInfluence(petal.x, petal.y, 100);

        // Touch makes petals swirl/flutter
        petal.y += petal.speed + influence.y * 0.1;
        petal.x += Math.sin(elapsed + petal.wobble) * 0.5 + influence.x * 0.15;

        if (petal.y > canvas.height + 10) {
          petal.y = -10;
          petal.x = Math.random() * canvas.width;
        }

        ctx.beginPath();
        ctx.ellipse(petal.x, petal.y, petal.size * 0.5, petal.size, elapsed + petal.wobble, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, ${200 + influence.strength * 30}, ${210 + influence.strength * 20}, ${0.3 + breath * 0.2 + influence.strength * 0.3})`;
        ctx.fill();
      });

      // Draw touch ripples
      drawRipples(ctx);
    };

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    animate();

    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [currentMode, getInteractionInfluence, drawRipples]);

  // ========== MYCELIUM NETWORK MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'mycelium' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    // Generate network nodes
    const nodes = [];
    const connections = [];
    const nodeCount = 40;

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 3 + Math.random() * 4,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Create connections between nearby nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        if (dist < 200) {
          connections.push({ from: i, to: j, pulseOffset: Math.random() });
        }
      }
    }

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = (Date.now() - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw connections with traveling pulses
      connections.forEach(conn => {
        const from = nodes[conn.from];
        const to = nodes[conn.to];

        // Check touch influence on connection midpoint
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        const influence = getInteractionInfluence(midX, midY, 150);

        ctx.strokeStyle = `rgba(127, 219, 202, ${0.1 + breath * 0.1 + influence.strength * 0.3})`;
        ctx.lineWidth = 0.5 + influence.strength * 1.5;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();

        // Traveling pulse - faster when touched
        const pulseSpeed = 0.3 + influence.strength * 0.5;
        const pulsePos = ((elapsed * pulseSpeed + conn.pulseOffset) % 1);
        const px = from.x + (to.x - from.x) * pulsePos;
        const py = from.y + (to.y - from.y) * pulsePos;

        ctx.beginPath();
        ctx.arc(px, py, 2 + influence.strength * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(127, 219, 202, ${0.5 + breath * 0.3 + influence.strength * 0.3})`;
        ctx.fill();
      });

      // Draw nodes with touch glow
      nodes.forEach(node => {
        const influence = getInteractionInfluence(node.x, node.y, 120);
        const pulse = Math.sin(elapsed * 2 + node.phase) * 0.3;
        const radius = node.radius * (1 + pulse) * (0.8 + breath * 0.2) * (1 + influence.strength * 0.5);

        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 2);
        gradient.addColorStop(0, `rgba(127, 219, 202, ${0.6 + breath * 0.3 + influence.strength * 0.4})`);
        gradient.addColorStop(1, 'rgba(127, 219, 202, 0)');

        ctx.beginPath();
        ctx.arc(node.x + influence.x * 0.1, node.y + influence.y * 0.1, radius * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      // Draw touch ripples
      drawRipples(ctx);
    };

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    animate();

    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [currentMode, getInteractionInfluence, drawRipples]);

  // ========== BREATH TREE (LUNGS) MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'lungs' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    // Generate bronchial tree
    const branches = [];

    const generateLung = (x, y, angle, depth, maxDepth, side) => {
      if (depth > maxDepth) return;

      const length = 60 - depth * 8;
      const endX = x + Math.cos(angle) * length;
      const endY = y + Math.sin(angle) * length;

      branches.push({ x1: x, y1: y, x2: endX, y2: endY, depth, maxDepth, side });

      const spread = 0.4 - depth * 0.03;
      generateLung(endX, endY, angle - spread, depth + 1, maxDepth, side);
      generateLung(endX, endY, angle + spread, depth + 1, maxDepth, side);
    };

    const centerX = canvas.width / 2;
    const startY = canvas.height * 0.2;

    // Trachea
    branches.push({ x1: centerX, y1: startY - 40, x2: centerX, y2: startY, depth: 0, maxDepth: 6, side: 'center' });

    // Left and right lungs
    generateLung(centerX, startY, Math.PI / 2 - 0.5, 1, 6, 'left');
    generateLung(centerX, startY, Math.PI / 2 + 0.5, 1, 6, 'right');

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = (Date.now() - startTime) / 1000;
      const breath = getBreathPhase(elapsed);
      const isInhaling = Math.sin(elapsed * BREATH_SPEED) > 0;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw branches with breath-synced light flow
      branches.forEach(branch => {
        const t = branch.depth / branch.maxDepth;

        // Touch influence - bronchial tree responds to touch
        const influence = getInteractionInfluence(branch.x2, branch.y2, 150);

        // Base branch color - brighter when touched
        const baseOpacity = 0.3 + breath * 0.3 + influence.strength * 0.3;
        ctx.strokeStyle = `rgba(127, ${180 + influence.strength * 40}, ${180 + influence.strength * 40}, ${baseOpacity})`;
        ctx.lineWidth = Math.max(1, 6 - branch.depth * 0.8) + influence.strength * 2;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(branch.x1, branch.y1);
        ctx.lineTo(branch.x2 + influence.x * 0.15, branch.y2 + influence.y * 0.15);
        ctx.stroke();

        // Breath light flowing through branches
        const flowProgress = isInhaling
          ? (breath * (1 - t)) // Light flows in during inhale
          : ((1 - breath) * t); // Light flows out during exhale

        if (flowProgress > 0.1) {
          const glowX = branch.x1 + (branch.x2 - branch.x1) * (isInhaling ? breath : 1 - breath);
          const glowY = branch.y1 + (branch.y2 - branch.y1) * (isInhaling ? breath : 1 - breath);

          const gradient = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, 15);
          gradient.addColorStop(0, `rgba(200, 240, 255, ${flowProgress * 0.6})`);
          gradient.addColorStop(1, 'rgba(127, 219, 202, 0)');

          ctx.beginPath();
          ctx.arc(glowX, glowY, 15, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }

        // Alveoli glow at branch tips - brighter when touched
        if (branch.depth === branch.maxDepth) {
          const glowSize = 8 + breath * 8 + influence.strength * 10;
          const tipX = branch.x2 + influence.x * 0.15;
          const tipY = branch.y2 + influence.y * 0.15;
          const gradient = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, glowSize);
          gradient.addColorStop(0, `rgba(200, 240, 255, ${0.3 + breath * 0.4 + influence.strength * 0.4})`);
          gradient.addColorStop(1, 'rgba(127, 219, 202, 0)');

          ctx.beginPath();
          ctx.arc(tipX, tipY, glowSize, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      });

      // Draw touch ripples
      drawRipples(ctx);

      // Breath indicator text
      ctx.fillStyle = `rgba(200, 240, 255, ${0.3 + breath * 0.3})`;
      ctx.font = '16px "Jost", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isInhaling ? 'breathe in' : 'breathe out', centerX, canvas.height - 40);
    };

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    animate();

    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [currentMode, getInteractionInfluence, drawRipples]);

  // ========== RAIN ON GLASS MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'rain' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    // Raindrop class
    class RainDrop {
      constructor(x, y, radius) {
        this.x = x ?? Math.random() * canvas.width;
        this.y = y ?? -20;
        this.radius = radius ?? (Math.random() * 10 + 3);
        this.velocity = { x: 0, y: Math.random() * 2 + 1 };
        this.mass = this.radius * 0.5;
        this.stuck = Math.random() < 0.3;
        this.stuckTime = 0;
        this.trail = [];
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.08 + 0.03;
        this.alive = true;
        this.opacity = 1;
      }

      update(dt, breath, tiltX) {
        if (this.stuck) {
          this.stuckTime += dt;
          const tensionBreakTime = 80 / this.mass;
          if (this.stuckTime > tensionBreakTime) {
            this.stuck = false;
          }
          this.recordTrail();
          return;
        }

        // Gravity affected by breath (slower on inhale)
        const gravity = 0.12 * (0.7 + breath * 0.6);
        this.velocity.y += gravity * this.mass * dt * 0.08;

        // Tilt influence
        this.velocity.x += tiltX * 0.03 * dt * 0.1;

        // Wobble
        this.wobble += this.wobbleSpeed * dt * 0.1;
        this.velocity.x += Math.sin(this.wobble) * 0.02;

        // Terminal velocity
        this.velocity.y = Math.min(this.velocity.y, 6);
        this.velocity.x *= 0.98;

        // Update position
        this.x += this.velocity.x * dt * 0.1;
        this.y += this.velocity.y * dt * 0.1;

        this.recordTrail();

        // Random sticking
        if (Math.random() < 0.0008 * dt) {
          this.stuck = true;
          this.stuckTime = 0;
          this.velocity.y *= 0.1;
        }

        // Remove if off screen
        if (this.y > canvas.height + 50 || this.x < -50 || this.x > canvas.width + 50) {
          this.alive = false;
        }
      }

      recordTrail() {
        const last = this.trail[this.trail.length - 1];
        if (!last || Math.hypot(this.x - last.x, this.y - last.y) > 2) {
          this.trail.push({ x: this.x, y: this.y, radius: this.radius * 0.3 });
        }
        if (this.trail.length > 40) this.trail.shift();
      }

      draw(ctx, breath) {
        const r = this.radius;

        // Outer glow
        const glowGradient = ctx.createRadialGradient(this.x, this.y, r * 0.3, this.x, this.y, r * 1.8);
        glowGradient.addColorStop(0, `rgba(127, 219, 202, ${0.15 * this.opacity * breath})`);
        glowGradient.addColorStop(1, 'rgba(127, 219, 202, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, r * 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Elongate when moving fast
        const stretch = Math.min(1 + Math.abs(this.velocity.y) * 0.08, 1.4);
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(1, stretch);

        // Drop gradient
        const dropGradient = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r);
        dropGradient.addColorStop(0, `rgba(200, 240, 255, ${0.5 * this.opacity})`);
        dropGradient.addColorStop(0.3, `rgba(127, 219, 202, ${0.35 * this.opacity})`);
        dropGradient.addColorStop(0.7, `rgba(100, 180, 170, ${0.2 * this.opacity})`);
        dropGradient.addColorStop(1, `rgba(80, 150, 140, ${0.1 * this.opacity})`);

        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fillStyle = dropGradient;
        ctx.fill();

        // Highlight
        ctx.beginPath();
        ctx.arc(-r * 0.25, -r * 0.25, r * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.6 * this.opacity})`;
        ctx.fill();

        // Edge
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(200, 240, 255, ${0.25 * this.opacity})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        ctx.restore();
      }

      absorb(other) {
        this.radius = Math.sqrt(this.radius ** 2 + other.radius ** 2);
        this.mass = this.radius * 0.5;
        const totalMass = this.mass + other.mass;
        this.velocity.x = (this.velocity.x * this.mass + other.velocity.x * other.mass) / totalMass;
        this.velocity.y = (this.velocity.y * this.mass + other.velocity.y * other.mass) / totalMass;
        this.stuck = false;
        this.stuckTime = 0;
      }
    }

    // Bokeh light class
    class BokehLight {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.baseX = this.x;
        this.baseY = this.y;
        this.radius = Math.random() * 50 + 20;
        this.hue = [170, 180, 190, 160][Math.floor(Math.random() * 4)]; // Teal hues
        this.saturation = Math.random() * 30 + 40;
        this.lightness = Math.random() * 25 + 45;
        this.opacity = Math.random() * 0.3 + 0.1;
        this.phase = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.0008 + 0.0004;
      }

      update(time, tiltX, tiltY) {
        this.x = this.baseX + tiltX * (this.radius * 0.4);
        this.y = this.baseY + tiltY * (this.radius * 0.25);
        this.currentOpacity = this.opacity * (0.7 + Math.sin(time * this.pulseSpeed + this.phase) * 0.3);
      }

      draw(ctx) {
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${this.currentOpacity})`);
        gradient.addColorStop(0.5, `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${this.currentOpacity * 0.3})`);
        gradient.addColorStop(1, `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, 0)`);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    }

    // Initialize
    const drops = [];
    const bokehLights = [];
    const bokehCount = Math.floor((canvas.width * canvas.height) / 20000);
    for (let i = 0; i < bokehCount; i++) {
      bokehLights.push(new BokehLight());
    }

    // Fog state (drawn to offscreen canvas)
    const fogCanvas = document.createElement('canvas');
    fogCanvas.width = canvas.width;
    fogCanvas.height = canvas.height;
    const fogCtx = fogCanvas.getContext('2d');

    // Initialize fog
    fogCtx.fillStyle = 'rgba(180, 200, 210, 0.25)';
    fogCtx.fillRect(0, 0, fogCanvas.width, fogCanvas.height);
    for (let i = 0; i < 500; i++) {
      const x = Math.random() * fogCanvas.width;
      const y = Math.random() * fogCanvas.height;
      const size = Math.random() * 40 + 15;
      fogCtx.beginPath();
      fogCtx.arc(x, y, size, 0, Math.PI * 2);
      fogCtx.fillStyle = `rgba(180, 200, 210, ${Math.random() * 0.08})`;
      fogCtx.fill();
    }

    // Trail canvas
    const trailCanvas = document.createElement('canvas');
    trailCanvas.width = canvas.width;
    trailCanvas.height = canvas.height;
    const trailCtx = trailCanvas.getContext('2d');

    let tiltX = 0;
    let tiltY = 0;
    let lastFrameTime = Date.now();

    // Touch influence on tilt
    const updateTiltFromTouch = () => {
      if (touchPointsRef.current.length > 0) {
        const activeTouch = touchPointsRef.current.find(p => p.active) || touchPointsRef.current[0];
        if (activeTouch) {
          const normalizedX = (activeTouch.x / canvas.width - 0.5) * 2;
          tiltX = tiltX * 0.9 + normalizedX * 1.5 * 0.1;
        }
      } else {
        tiltX *= 0.98;
        tiltY *= 0.98;
      }
    };

    // Draw in fog (clear fog where touched)
    const drawInFog = (x, y, size = 35) => {
      fogCtx.save();
      fogCtx.globalCompositeOperation = 'destination-out';
      const gradient = fogCtx.createRadialGradient(x, y, 0, x, y, size);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
      gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.5)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      fogCtx.fillStyle = gradient;
      fogCtx.beginPath();
      fogCtx.arc(x, y, size, 0, Math.PI * 2);
      fogCtx.fill();
      fogCtx.restore();
    };

    // Spawn drops based on breath
    const spawnDrop = (breath) => {
      const rate = 0.04 + breath * 0.06; // More drops on exhale
      if (Math.random() < rate) {
        drops.push(new RainDrop());
      }
    };

    // Check for drop merges
    const checkMerges = () => {
      for (let i = 0; i < drops.length; i++) {
        if (!drops[i].alive) continue;
        for (let j = i + 1; j < drops.length; j++) {
          if (!drops[j].alive) continue;
          const d = Math.hypot(drops[i].x - drops[j].x, drops[i].y - drops[j].y);
          const touchDist = (drops[i].radius + drops[j].radius) * 0.75;
          if (d < touchDist) {
            if (drops[i].radius >= drops[j].radius) {
              drops[i].absorb(drops[j]);
              drops[j].alive = false;
            } else {
              drops[j].absorb(drops[i]);
              drops[i].alive = false;
            }
          }
        }
      }
      // Clean up and enforce max
      for (let i = drops.length - 1; i >= 0; i--) {
        if (!drops[i].alive) drops.splice(i, 1);
      }
      if (drops.length > 150) drops.splice(0, drops.length - 150);
    };

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;
      const dt = Math.min(now - lastFrameTime, 50);
      lastFrameTime = now;

      const breath = getBreathPhase(elapsed);
      updateTiltFromTouch();

      // Clear main canvas
      ctx.fillStyle = '#050508';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw bokeh (background)
      ctx.globalCompositeOperation = 'lighter';
      bokehLights.forEach(light => {
        light.update(now, tiltX, tiltY);
        light.draw(ctx);
      });
      ctx.globalCompositeOperation = 'source-over';

      // Apply blur to background
      ctx.filter = 'blur(12px)';
      ctx.drawImage(canvas, 0, 0);
      ctx.filter = 'none';

      // Spawn and update drops
      spawnDrop(breath);
      drops.forEach(drop => drop.update(dt, breath, tiltX));
      checkMerges();

      // Draw trails (fade existing)
      trailCtx.fillStyle = 'rgba(5, 5, 8, 0.03)';
      trailCtx.fillRect(0, 0, trailCanvas.width, trailCanvas.height);
      drops.forEach(drop => {
        if (drop.trail.length < 2) return;
        trailCtx.beginPath();
        trailCtx.moveTo(drop.trail[0].x, drop.trail[0].y);
        for (let i = 1; i < drop.trail.length; i++) {
          trailCtx.lineTo(drop.trail[i].x, drop.trail[i].y);
        }
        trailCtx.strokeStyle = `rgba(127, 219, 202, 0.12)`;
        trailCtx.lineWidth = drop.radius * 0.35;
        trailCtx.lineCap = 'round';
        trailCtx.stroke();
      });
      ctx.drawImage(trailCanvas, 0, 0);

      // Draw drops
      drops.forEach(drop => drop.draw(ctx, breath));

      // Regrow fog slowly
      fogCtx.fillStyle = `rgba(180, 200, 210, 0.002)`;
      fogCtx.fillRect(0, 0, fogCanvas.width, fogCanvas.height);

      // Handle touch - draw in fog and spawn drops
      touchPointsRef.current.forEach(point => {
        if (point.active) {
          drawInFog(point.x, point.y, 40);
          // Occasionally spawn drop at touch
          if (Math.random() < 0.1) {
            const drop = new RainDrop(point.x + (Math.random() - 0.5) * 20, point.y, Math.random() * 6 + 4);
            drop.stuck = true;
            drops.push(drop);
          }
        }
      });

      // Draw fog layer
      ctx.globalAlpha = 0.7 + breath * 0.2;
      ctx.drawImage(fogCanvas, 0, 0);
      ctx.globalAlpha = 1;

      // Draw touch ripples
      drawRipples(ctx);

      // Breath indicator
      const isInhaling = Math.sin(elapsed * BREATH_SPEED) > 0;
      ctx.fillStyle = `rgba(127, 219, 202, ${0.25 + breath * 0.25})`;
      ctx.font = '14px "Jost", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isInhaling ? 'breathe in' : 'breathe out', canvas.width / 2, canvas.height - 35);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      fogCanvas.width = canvas.width;
      fogCanvas.height = canvas.height;
      trailCanvas.width = canvas.width;
      trailCanvas.height = canvas.height;
      // Reinitialize fog
      fogCtx.fillStyle = 'rgba(180, 200, 210, 0.25)';
      fogCtx.fillRect(0, 0, fogCanvas.width, fogCanvas.height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [currentMode, getInteractionInfluence, drawRipples]);

  // ========== JELLYFISH MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'jellyfish' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    // Tentacle class with verlet physics
    class Tentacle {
      constructor(parent, index, segments, segmentLength, isOralArm = false) {
        this.parent = parent;
        this.index = index;
        this.segments = segments;
        this.segmentLength = segmentLength;
        this.isOralArm = isOralArm;
        this.points = [];
        this.oldPoints = [];

        const angleOffset = (index / (isOralArm ? 4 : 8)) * Math.PI * 2;
        const startX = Math.cos(angleOffset) * parent.size * (isOralArm ? 0.15 : 0.35);

        for (let i = 0; i < segments; i++) {
          this.points.push({
            x: parent.position.x + startX,
            y: parent.position.y + parent.bellHeight * 0.8 + i * segmentLength
          });
          this.oldPoints.push({ x: this.points[i].x, y: this.points[i].y });
        }
      }

      update(pulse, elapsed) {
        const angleOffset = (this.index / (this.isOralArm ? 4 : 8)) * Math.PI * 2;
        const expansion = 1 + pulse * 0.15;
        const attachRadius = this.isOralArm ? 0.15 : 0.4;

        // First point follows bell edge
        this.points[0].x = this.parent.position.x + Math.cos(angleOffset) * this.parent.size * attachRadius * expansion;
        this.points[0].y = this.parent.position.y + this.parent.bellHeight * 0.85;

        // Verlet integration
        for (let i = 1; i < this.segments; i++) {
          const p = this.points[i];
          const old = this.oldPoints[i];

          const vx = (p.x - old.x) * 0.96;
          const vy = (p.y - old.y) * 0.96;

          old.x = p.x;
          old.y = p.y;

          p.x += vx;
          p.y += vy + 0.03;

          // Sway
          const swayAmp = this.isOralArm ? 0.15 : 0.08;
          p.x += Math.sin(elapsed * 0.8 + i * 0.4 + this.index * 0.7) * swayAmp;
        }

        // Constraint iterations
        for (let j = 0; j < 3; j++) {
          for (let i = 1; i < this.segments; i++) {
            const p1 = this.points[i - 1];
            const p2 = this.points[i];

            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist === 0) continue;

            const diff = this.segmentLength - dist;
            const percent = diff / dist / 2;

            const offsetX = dx * percent;
            const offsetY = dy * percent;

            if (i > 1) {
              p1.x -= offsetX;
              p1.y -= offsetY;
            }
            p2.x += offsetX;
            p2.y += offsetY;
          }
        }
      }

      draw(ctx, hue, glow) {
        if (this.points.length < 2) return;

        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);

        // Smooth curve through points
        for (let i = 1; i < this.points.length - 1; i++) {
          const xc = (this.points[i].x + this.points[i + 1].x) / 2;
          const yc = (this.points[i].y + this.points[i + 1].y) / 2;
          ctx.quadraticCurveTo(this.points[i].x, this.points[i].y, xc, yc);
        }
        ctx.lineTo(this.points[this.points.length - 1].x, this.points[this.points.length - 1].y);

        const baseWidth = this.isOralArm ? 4 : 2.5;
        ctx.strokeStyle = `hsla(${hue}, 70%, 65%, ${0.4 + glow * 0.3})`;
        ctx.lineWidth = baseWidth;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Glow effect
        ctx.strokeStyle = `hsla(${hue}, 80%, 75%, ${0.15 + glow * 0.2})`;
        ctx.lineWidth = baseWidth + 4;
        ctx.stroke();
      }

      applyForce(fx, fy, strength) {
        for (let i = 1; i < this.points.length; i++) {
          this.points[i].x += fx * strength * (i / this.points.length);
          this.points[i].y += fy * strength * (i / this.points.length);
        }
      }
    }

    // Jellyfish class
    class Jellyfish {
      constructor(x, y, size) {
        this.position = { x, y };
        this.size = size;
        this.bellHeight = size * 0.6;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.018 + Math.random() * 0.008;
        this.driftVelocity = { x: (Math.random() - 0.5) * 0.3, y: -0.15 - Math.random() * 0.1 };
        this.lastPulse = 0;

        this.hue = Math.random() * 80 + 180; // Blues, cyans, purples
        this.glow = 0.5;
        this.following = false;
        this.bellSegments = 24;

        // Create tentacles
        this.tentacles = [];
        for (let i = 0; i < 8; i++) {
          this.tentacles.push(new Tentacle(this, i, 18, 7, false));
        }

        // Create oral arms (frillier, center)
        this.oralArms = [];
        for (let i = 0; i < 4; i++) {
          this.oralArms.push(new Tentacle(this, i, 12, 5, true));
        }
      }

      update(elapsed, breathPhase) {
        // Sync pulse with breath in breath mode
        const targetPhase = breathPhase * Math.PI;
        this.pulsePhase += (targetPhase - this.pulsePhase) * 0.02 + this.pulseSpeed * 0.3;

        const pulse = Math.sin(this.pulsePhase);

        // Propulsion on contraction
        if (pulse > 0.85 && this.lastPulse <= 0.85) {
          this.driftVelocity.y -= 0.4 + Math.random() * 0.2;
          this.driftVelocity.x += (Math.random() - 0.5) * 0.2;
        }
        this.lastPulse = pulse;

        // Apply physics
        this.position.x += this.driftVelocity.x;
        this.position.y += this.driftVelocity.y;

        // Friction and sink
        this.driftVelocity.x *= 0.992;
        this.driftVelocity.y *= 0.994;
        this.driftVelocity.y += 0.008;

        // Boundaries - wrap around
        if (this.position.y < -this.size * 2) this.position.y = canvas.height + this.size;
        if (this.position.y > canvas.height + this.size * 2) this.position.y = -this.size;
        if (this.position.x < -this.size) this.position.x = canvas.width + this.size;
        if (this.position.x > canvas.width + this.size) this.position.x = -this.size;

        // Decay glow
        if (!this.following) this.glow = this.glow * 0.98 + 0.5 * 0.02;

        // Update tentacles
        this.tentacles.forEach(t => t.update(pulse, elapsed));
        this.oralArms.forEach(o => o.update(pulse, elapsed));
      }

      draw(ctx) {
        const pulse = Math.sin(this.pulsePhase);
        const expansion = 1 + pulse * 0.15;

        ctx.save();
        ctx.translate(this.position.x, this.position.y);

        // Bell glow (outer)
        const glowGradient = ctx.createRadialGradient(0, this.bellHeight * 0.3, 0, 0, this.bellHeight * 0.3, this.size * 2);
        glowGradient.addColorStop(0, `hsla(${this.hue}, 80%, 70%, ${0.2 * this.glow})`);
        glowGradient.addColorStop(0.5, `hsla(${this.hue}, 70%, 50%, ${0.08 * this.glow})`);
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(0, this.bellHeight * 0.3, this.size * 2, 0, Math.PI * 2);
        ctx.fill();

        // Bell shape
        ctx.beginPath();
        for (let i = 0; i <= this.bellSegments; i++) {
          const angle = (i / this.bellSegments) * Math.PI;
          const x = Math.cos(angle) * this.size * expansion;
          const y = Math.sin(angle) * this.bellHeight * (1 - pulse * 0.12);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();

        // Bell gradient
        const bellGradient = ctx.createRadialGradient(0, -this.size * 0.2, 0, 0, this.bellHeight * 0.5, this.size * 1.2);
        bellGradient.addColorStop(0, `hsla(${this.hue}, 85%, 80%, ${0.5 + this.glow * 0.3})`);
        bellGradient.addColorStop(0.3, `hsla(${this.hue}, 75%, 60%, ${0.35 + this.glow * 0.2})`);
        bellGradient.addColorStop(0.7, `hsla(${this.hue}, 65%, 45%, ${0.2 + this.glow * 0.15})`);
        bellGradient.addColorStop(1, `hsla(${this.hue}, 55%, 35%, 0.1)`);
        ctx.fillStyle = bellGradient;
        ctx.fill();

        // Bell edge highlight
        ctx.strokeStyle = `hsla(${this.hue}, 90%, 85%, ${0.4 + this.glow * 0.4})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Inner bell details (gonads pattern)
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
          const r = this.size * 0.35;
          const cx = Math.cos(angle) * r * 0.5;
          const cy = this.bellHeight * 0.35 + Math.sin(angle) * r * 0.2;
          ctx.beginPath();
          ctx.arc(cx, cy, r * 0.25, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${this.hue + 20}, 70%, 70%, ${0.25 + this.glow * 0.2})`;
          ctx.fill();
        }

        ctx.restore();

        // Draw tentacles and oral arms
        this.tentacles.forEach(t => t.draw(ctx, this.hue, this.glow));
        this.oralArms.forEach(o => o.draw(ctx, this.hue + 15, this.glow));
      }

      applyForce(fx, fy) {
        this.driftVelocity.x += fx;
        this.driftVelocity.y += fy;
        this.tentacles.forEach(t => t.applyForce(fx, fy, 2));
        this.oralArms.forEach(o => o.applyForce(fx, fy, 1.5));
      }
    }

    // Plankton particle class
    class Plankton {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speed = Math.random() * 0.3 + 0.1;
        this.angle = Math.random() * Math.PI * 2;
        this.wobble = Math.random() * Math.PI * 2;
        this.opacity = Math.random() * 0.4 + 0.1;
      }

      update(elapsed) {
        this.wobble += 0.02;
        this.x += Math.cos(this.angle + Math.sin(this.wobble) * 0.5) * this.speed;
        this.y += Math.sin(this.angle) * this.speed * 0.5 - 0.1;

        if (this.y < -10) { this.y = canvas.height + 10; this.x = Math.random() * canvas.width; }
        if (this.x < -10) this.x = canvas.width + 10;
        if (this.x > canvas.width + 10) this.x = -10;
      }

      draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(150, 200, 220, ${this.opacity})`;
        ctx.fill();
      }
    }

    // Initialize
    const jellies = [];
    const jellyCount = Math.min(Math.floor(canvas.width / 300) + 2, 5);
    for (let i = 0; i < jellyCount; i++) {
      jellies.push(new Jellyfish(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        60 + Math.random() * 50
      ));
    }

    const plankton = [];
    for (let i = 0; i < 60; i++) {
      plankton.push(new Plankton());
    }

    // Water currents from touch
    const currents = [];

    // God rays
    const rays = [];
    for (let i = 0; i < 5; i++) {
      rays.push({
        x: Math.random() * canvas.width,
        width: Math.random() * 100 + 50,
        opacity: Math.random() * 0.06 + 0.02,
        speed: Math.random() * 0.2 + 0.1
      });
    }

    let lastTouchPos = null;

    // Touch handlers for jellyfish
    const handleJellyTouch = (x, y) => {
      jellies.forEach(jelly => {
        const dist = Math.hypot(x - jelly.position.x, y - jelly.position.y);

        if (dist < jelly.size * 1.2) {
          // Touched the jellyfish - glow and follow
          jelly.following = true;
          jelly.glow = 1.0;
        } else if (dist < jelly.size * 4) {
          // Near - startle and move away
          const angle = Math.atan2(jelly.position.y - y, jelly.position.x - x);
          jelly.applyForce(Math.cos(angle) * 0.4, Math.sin(angle) * 0.4);
          jelly.pulseSpeed = 0.035;
        }
      });

      // Create current
      currents.push({ x, y, radius: 0, strength: 1, direction: { x: 0, y: 0 } });
    };

    const handleJellyMove = (x, y) => {
      // Following jellyfish move toward finger
      jellies.filter(j => j.following).forEach(jelly => {
        const dx = x - jelly.position.x;
        const dy = y - jelly.position.y;
        jelly.driftVelocity.x += dx * 0.008;
        jelly.driftVelocity.y += dy * 0.008;
      });

      // Update current direction
      if (currents.length > 0 && lastTouchPos) {
        const current = currents[currents.length - 1];
        current.direction.x = (x - lastTouchPos.x) * 0.3;
        current.direction.y = (y - lastTouchPos.y) * 0.3;
      }
      lastTouchPos = { x, y };
    };

    const handleJellyEnd = () => {
      jellies.forEach(jelly => {
        jelly.following = false;
        jelly.pulseSpeed = 0.018 + Math.random() * 0.008;
      });
      lastTouchPos = null;
    };

    // Apply currents to jellies
    const applyCurrent = () => {
      currents.forEach((current, idx) => {
        current.radius += 3;
        current.strength *= 0.97;

        jellies.forEach(jelly => {
          const dist = Math.hypot(current.x - jelly.position.x, current.y - jelly.position.y);
          if (dist < current.radius && dist > current.radius - 60) {
            const influence = current.strength * (1 - dist / Math.max(current.radius, 1)) * 0.5;
            jelly.applyForce(current.direction.x * influence, current.direction.y * influence);
          }
        });

        if (current.strength < 0.02) currents.splice(idx, 1);
      });
    };

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      // Check for touch interactions
      touchPointsRef.current.forEach(point => {
        if (point.active) {
          if (!point.jellyTouched) {
            handleJellyTouch(point.x, point.y);
            point.jellyTouched = true;
          }
          handleJellyMove(point.x, point.y);
        } else if (point.jellyTouched) {
          handleJellyEnd();
          point.jellyTouched = false;
        }
      });

      // Background gradient (deep ocean)
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, '#0a1628');
      bgGradient.addColorStop(0.5, '#061018');
      bgGradient.addColorStop(1, '#020508');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // God rays
      ctx.globalCompositeOperation = 'lighter';
      rays.forEach(ray => {
        ray.x += ray.speed;
        if (ray.x > canvas.width + ray.width) ray.x = -ray.width;

        const rayGradient = ctx.createLinearGradient(ray.x, 0, ray.x + ray.width, canvas.height);
        rayGradient.addColorStop(0, `rgba(100, 150, 180, ${ray.opacity * (0.7 + breath * 0.3)})`);
        rayGradient.addColorStop(0.3, `rgba(80, 130, 160, ${ray.opacity * 0.5})`);
        rayGradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.moveTo(ray.x, 0);
        ctx.lineTo(ray.x + ray.width, 0);
        ctx.lineTo(ray.x + ray.width * 1.5, canvas.height);
        ctx.lineTo(ray.x - ray.width * 0.5, canvas.height);
        ctx.closePath();
        ctx.fillStyle = rayGradient;
        ctx.fill();
      });
      ctx.globalCompositeOperation = 'source-over';

      // Plankton
      plankton.forEach(p => {
        p.update(elapsed);
        p.draw(ctx);
      });

      // Apply currents
      applyCurrent();

      // Update and draw jellyfish
      jellies.forEach(jelly => {
        jelly.update(elapsed, breath);
        jelly.draw(ctx);
      });

      // Touch ripples
      drawRipples(ctx);

      // Breath indicator
      const isInhaling = Math.sin(elapsed * BREATH_SPEED) > 0;
      ctx.fillStyle = `rgba(100, 180, 200, ${0.2 + breath * 0.25})`;
      ctx.font = '14px "Jost", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isInhaling ? 'breathe in' : 'breathe out', canvas.width / 2, canvas.height - 35);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [currentMode, getInteractionInfluence, drawRipples]);

  // ========== INK IN WATER MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'ink' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    // Grid-based fluid simulation
    const GRID_SIZE = 96; // Balance between quality and performance
    const grid = {
      density: new Float32Array(GRID_SIZE * GRID_SIZE),
      velocityX: new Float32Array(GRID_SIZE * GRID_SIZE),
      velocityY: new Float32Array(GRID_SIZE * GRID_SIZE),
      colorR: new Float32Array(GRID_SIZE * GRID_SIZE),
      colorG: new Float32Array(GRID_SIZE * GRID_SIZE),
      colorB: new Float32Array(GRID_SIZE * GRID_SIZE),
    };

    // Ink colors - luminous on dark background
    const inkColors = [
      { r: 0.3, g: 0.5, b: 1.0 },     // Electric Blue
      { r: 1.0, g: 0.3, b: 0.4 },     // Coral
      { r: 0.2, g: 0.9, b: 0.6 },     // Mint
      { r: 0.7, g: 0.4, b: 1.0 },     // Lavender
      { r: 1.0, g: 0.8, b: 0.2 },     // Gold
      { r: 0.5, g: 0.86, b: 0.8 },    // Teal (matches app accent)
    ];
    let colorIndex = 0;

    // Diffusion helper
    const diffuse = (field, rate) => {
      const a = rate * GRID_SIZE * GRID_SIZE * 0.01;
      const temp = new Float32Array(field.length);
      temp.set(field);

      for (let k = 0; k < 4; k++) {
        for (let i = 1; i < GRID_SIZE - 1; i++) {
          for (let j = 1; j < GRID_SIZE - 1; j++) {
            const idx = i + j * GRID_SIZE;
            field[idx] = (temp[idx] + a * (
              field[idx - 1] + field[idx + 1] +
              field[idx - GRID_SIZE] + field[idx + GRID_SIZE]
            )) / (1 + 4 * a);
          }
        }
      }
    };

    // Advection helper
    const advect = (field, velX, velY, dt) => {
      const newField = new Float32Array(field.length);
      const scale = dt * GRID_SIZE * 0.5;

      for (let i = 1; i < GRID_SIZE - 1; i++) {
        for (let j = 1; j < GRID_SIZE - 1; j++) {
          const idx = i + j * GRID_SIZE;

          let x = i - scale * velX[idx];
          let y = j - scale * velY[idx];

          x = Math.max(0.5, Math.min(GRID_SIZE - 1.5, x));
          y = Math.max(0.5, Math.min(GRID_SIZE - 1.5, y));

          const i0 = Math.floor(x), i1 = i0 + 1;
          const j0 = Math.floor(y), j1 = j0 + 1;
          const s1 = x - i0, s0 = 1 - s1;
          const t1 = y - j0, t0 = 1 - t1;

          newField[idx] =
            s0 * (t0 * field[i0 + j0 * GRID_SIZE] + t1 * field[i0 + j1 * GRID_SIZE]) +
            s1 * (t0 * field[i1 + j0 * GRID_SIZE] + t1 * field[i1 + j1 * GRID_SIZE]);
        }
      }
      field.set(newField);
    };

    // Fluid simulation step
    const fluidStep = (dt) => {
      // Diffuse velocity (viscosity)
      diffuse(grid.velocityX, 0.00005);
      diffuse(grid.velocityY, 0.00005);

      // Advect velocity
      advect(grid.velocityX, grid.velocityX, grid.velocityY, dt);
      advect(grid.velocityY, grid.velocityX, grid.velocityY, dt);

      // Diffuse density
      diffuse(grid.density, 0.0002);
      diffuse(grid.colorR, 0.0002);
      diffuse(grid.colorG, 0.0002);
      diffuse(grid.colorB, 0.0002);

      // Advect density and color
      advect(grid.density, grid.velocityX, grid.velocityY, dt);
      advect(grid.colorR, grid.velocityX, grid.velocityY, dt);
      advect(grid.colorG, grid.velocityX, grid.velocityY, dt);
      advect(grid.colorB, grid.velocityX, grid.velocityY, dt);

      // Decay
      for (let i = 0; i < grid.density.length; i++) {
        grid.density[i] *= 0.998;
        grid.velocityX[i] *= 0.995;
        grid.velocityY[i] *= 0.995;
      }
    };

    // Add ink at position
    const addInk = (x, y, color, radius = 6) => {
      const gx = Math.floor((x / canvas.width) * GRID_SIZE);
      const gy = Math.floor((y / canvas.height) * GRID_SIZE);

      for (let ox = -radius; ox <= radius; ox++) {
        for (let oy = -radius; oy <= radius; oy++) {
          const dist = Math.sqrt(ox * ox + oy * oy);
          if (dist > radius) continue;

          const i = gx + ox;
          const j = gy + oy;
          if (i < 0 || i >= GRID_SIZE || j < 0 || j >= GRID_SIZE) continue;

          const idx = i + j * GRID_SIZE;
          const influence = (1 - dist / radius) * 0.4;

          grid.density[idx] += influence;
          grid.colorR[idx] += color.r * influence;
          grid.colorG[idx] += color.g * influence;
          grid.colorB[idx] += color.b * influence;

          // Slight downward velocity (ink sinks)
          grid.velocityY[idx] += influence * 0.02;
        }
      }
    };

    // Add velocity at position (for drag)
    const addVelocity = (x, y, vx, vy, radius = 8) => {
      const gx = Math.floor((x / canvas.width) * GRID_SIZE);
      const gy = Math.floor((y / canvas.height) * GRID_SIZE);

      for (let ox = -radius; ox <= radius; ox++) {
        for (let oy = -radius; oy <= radius; oy++) {
          const dist = Math.sqrt(ox * ox + oy * oy);
          if (dist > radius) continue;

          const i = gx + ox;
          const j = gy + oy;
          if (i < 0 || i >= GRID_SIZE || j < 0 || j >= GRID_SIZE) continue;

          const idx = i + j * GRID_SIZE;
          const influence = 1 - dist / radius;

          grid.velocityX[idx] += vx * influence * 0.15;
          grid.velocityY[idx] += vy * influence * 0.15;
        }
      }
    };

    // Apply radial force (for breath sync)
    const applyRadialForce = (cx, cy, strength) => {
      const gcx = (cx / canvas.width) * GRID_SIZE;
      const gcy = (cy / canvas.height) * GRID_SIZE;

      for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
          const dx = i - gcx;
          const dy = j - gcy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 0 && dist < GRID_SIZE * 0.4) {
            const idx = i + j * GRID_SIZE;
            const influence = (1 - dist / (GRID_SIZE * 0.4)) * strength;

            grid.velocityX[idx] += (dx / dist) * influence;
            grid.velocityY[idx] += (dy / dist) * influence;
          }
        }
      }
    };

    // Render offscreen then draw
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = GRID_SIZE;
    offscreenCanvas.height = GRID_SIZE;
    const offCtx = offscreenCanvas.getContext('2d');

    const render = () => {
      const imageData = offCtx.createImageData(GRID_SIZE, GRID_SIZE);

      for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
          const idx = i + j * GRID_SIZE;
          const pixelIdx = (i + j * GRID_SIZE) * 4;

          const density = Math.min(1, grid.density[idx]);

          // Dark background (5, 5, 12) - matching app theme
          const bgR = 5, bgG = 5, bgB = 12;

          if (density > 0.005) {
            const totalColor = grid.colorR[idx] + grid.colorG[idx] + grid.colorB[idx];

            if (totalColor > 0.001) {
              const r = (grid.colorR[idx] / totalColor) * 255;
              const g = (grid.colorG[idx] / totalColor) * 255;
              const b = (grid.colorB[idx] / totalColor) * 255;

              // Blend ink with dark background
              imageData.data[pixelIdx + 0] = Math.floor(bgR * (1 - density) + r * density);
              imageData.data[pixelIdx + 1] = Math.floor(bgG * (1 - density) + g * density);
              imageData.data[pixelIdx + 2] = Math.floor(bgB * (1 - density) + b * density);
              imageData.data[pixelIdx + 3] = 255;
            } else {
              imageData.data[pixelIdx + 0] = bgR;
              imageData.data[pixelIdx + 1] = bgG;
              imageData.data[pixelIdx + 2] = bgB;
              imageData.data[pixelIdx + 3] = 255;
            }
          } else {
            imageData.data[pixelIdx + 0] = bgR;
            imageData.data[pixelIdx + 1] = bgG;
            imageData.data[pixelIdx + 2] = bgB;
            imageData.data[pixelIdx + 3] = 255;
          }
        }
      }

      offCtx.putImageData(imageData, 0, 0);

      // Scale up to canvas with smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(offscreenCanvas, 0, 0, canvas.width, canvas.height);
    };

    let lastTouchPos = {};
    let holdingTouch = false;
    let lastInkTime = 0;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;
      const breath = getBreathPhase(elapsed);
      const isInhaling = Math.sin(elapsed * BREATH_SPEED) > 0;

      // Breath sync - ink gathers on inhale, expands on exhale
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      if (isInhaling) {
        applyRadialForce(centerX, centerY, -0.003 * breath);
      } else {
        applyRadialForce(centerX, centerY, 0.004 * (1 - breath));
      }

      // Auto-drop ink on breath cycle peak
      if (breath > 0.95 && now - lastInkTime > 3000) {
        const color = inkColors[colorIndex];
        addInk(centerX + (Math.random() - 0.5) * 100, centerY + (Math.random() - 0.5) * 100, color, 8);
        colorIndex = (colorIndex + 1) % inkColors.length;
        lastInkTime = now;
      }

      // Handle touch interactions
      touchPointsRef.current.forEach(point => {
        if (point.active) {
          const lastPos = lastTouchPos[point.id] || { x: point.x, y: point.y };
          const dx = point.x - lastPos.x;
          const dy = point.y - lastPos.y;

          // Add velocity from drag
          if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
            addVelocity(point.x, point.y, dx, dy, 10);
          }

          // Continuous ink stream if holding
          if (!point.inkDropped) {
            const color = inkColors[colorIndex];
            addInk(point.x, point.y, color, 7);
            colorIndex = (colorIndex + 1) % inkColors.length;
            point.inkDropped = true;
          } else if (holdingTouch && now % 80 < 20) {
            const color = inkColors[colorIndex];
            addInk(point.x + (Math.random() - 0.5) * 15, point.y + (Math.random() - 0.5) * 15, color, 4);
          }

          lastTouchPos[point.id] = { x: point.x, y: point.y };

          // Set holding after 300ms
          if (!point.holdStart) point.holdStart = now;
          if (now - point.holdStart > 300) holdingTouch = true;
        } else {
          delete lastTouchPos[point.id];
          point.inkDropped = false;
          point.holdStart = null;
          holdingTouch = false;
        }
      });

      // Fluid simulation step
      fluidStep(0.016);

      // Render
      render();

      // Draw touch ripples
      drawRipples(ctx);

      // Breath indicator
      ctx.fillStyle = `rgba(100, 120, 150, ${0.3 + breath * 0.3})`;
      ctx.font = '14px "Jost", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isInhaling ? 'breathe in' : 'breathe out', canvas.width / 2, canvas.height - 35);

      // Color indicator
      const currentColor = inkColors[colorIndex];
      ctx.beginPath();
      ctx.arc(canvas.width / 2, 30, 8, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${currentColor.r * 255}, ${currentColor.g * 255}, ${currentColor.b * 255})`;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [currentMode, getInteractionInfluence, drawRipples]);

  // ========== FIREFLIES MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'fireflies' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    // Firefly class
    class Firefly {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height * 0.7 + canvas.height * 0.15;
        this.z = Math.random(); // Depth

        this.vx = 0;
        this.vy = 0;
        this.targetX = this.x;
        this.targetY = this.y;
        this.wanderAngle = Math.random() * Math.PI * 2;

        // Glow pattern
        this.glowPhase = Math.random() * Math.PI * 2;
        this.glowSpeed = 0.015 + Math.random() * 0.02;
        this.pattern = this.generatePattern();
        this.patternTime = Math.random() * 10;

        this.size = 2 + this.z * 3;
        this.hue = 55 + Math.random() * 25; // Yellow-green
      }

      generatePattern() {
        const patterns = [
          [0.4, 2.5],
          [0.25, 0.25, 0.25, 2.2],
          [0.15, 0.15, 0.15, 0.15, 0.15, 2.8],
          [0.8, 1.8],
        ];
        return patterns[Math.floor(Math.random() * patterns.length)];
      }

      update(dt) {
        // Wander
        this.wanderAngle += (Math.random() - 0.5) * 0.25;
        this.targetX += Math.cos(this.wanderAngle) * 0.4;
        this.targetY += Math.sin(this.wanderAngle) * 0.3;

        // Boundaries
        const margin = 60;
        if (this.targetX < margin) this.wanderAngle = Math.random() * 0.5;
        if (this.targetX > canvas.width - margin) this.wanderAngle = Math.PI + Math.random() * 0.5;
        if (this.targetY < canvas.height * 0.15) this.wanderAngle = Math.PI * 0.5;
        if (this.targetY > canvas.height * 0.85) this.wanderAngle = -Math.PI * 0.5;

        // Move toward target
        this.vx += (this.targetX - this.x) * 0.008;
        this.vy += (this.targetY - this.y) * 0.008;

        // Damping
        this.vx *= 0.96;
        this.vy *= 0.96;

        // Apply velocity
        const speed = 0.4 + this.z * 0.4;
        this.x += this.vx * speed;
        this.y += this.vy * speed;

        // Update glow
        this.patternTime += dt * 0.001;
      }

      getGlow() {
        let totalTime = 0;
        for (let i = 0; i < this.pattern.length; i++) {
          totalTime += this.pattern[i];
        }

        const cycleTime = this.patternTime % totalTime;
        let elapsed = 0;
        let isOn = true;

        for (let i = 0; i < this.pattern.length; i++) {
          elapsed += this.pattern[i];
          if (cycleTime < elapsed) {
            const segmentStart = elapsed - this.pattern[i];
            const segmentProgress = (cycleTime - segmentStart) / this.pattern[i];
            if (isOn) {
              if (segmentProgress < 0.15) return segmentProgress / 0.15;
              if (segmentProgress > 0.75) return 1 - (segmentProgress - 0.75) / 0.25;
              return 1;
            }
            return 0;
          }
          isOn = !isOn;
        }
        return 0;
      }

      draw(ctx) {
        const glow = this.getGlow();
        if (glow < 0.02) return;

        const alpha = glow * (0.4 + this.z * 0.5);

        // Outer glow
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 10);
        gradient.addColorStop(0, `hsla(${this.hue}, 100%, 75%, ${alpha})`);
        gradient.addColorStop(0.25, `hsla(${this.hue}, 100%, 55%, ${alpha * 0.5})`);
        gradient.addColorStop(1, `hsla(${this.hue}, 100%, 40%, 0)`);

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 10, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Bright core
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 100%, 92%, ${alpha})`;
        ctx.fill();
      }

      attract(px, py, strength) {
        const dx = px - this.x;
        const dy = py - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 180 && dist > 15) {
          const force = strength * (1 - dist / 180) * 0.4;
          this.vx += (dx / dist) * force;
          this.vy += (dy / dist) * force;
        } else if (dist <= 15) {
          // Orbit
          this.vx += (-dy / dist) * 0.15;
          this.vy += (dx / dist) * 0.15;
        }
      }
    }

    // Star class
    class Star {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height * 0.5;
        this.size = Math.random() * 1.5 + 0.5;
        this.brightness = Math.random() * 0.5 + 0.3;
        this.phase = Math.random() * Math.PI * 2;
        this.twinkleSpeed = Math.random() * 0.002 + 0.001;
      }

      draw(ctx, time) {
        const twinkle = 0.5 + Math.sin(time * this.twinkleSpeed + this.phase) * 0.5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * this.brightness})`;
        ctx.fill();
      }
    }

    // Initialize
    const fireflies = [];
    const fireflyCount = Math.min(Math.floor((canvas.width * canvas.height) / 12000), 60);
    for (let i = 0; i < fireflyCount; i++) {
      fireflies.push(new Firefly());
    }

    const stars = [];
    for (let i = 0; i < 100; i++) {
      stars.push(new Star());
    }

    // Pre-generate treeline
    const treelinePoints = [];
    for (let x = 0; x <= canvas.width + 20; x += 15) {
      const height = 80 + Math.sin(x * 0.012) * 35 + Math.sin(x * 0.028) * 20 + Math.random() * 15;
      treelinePoints.push({ x, y: canvas.height - height });
    }

    // Draw environment
    const drawEnvironment = (time, breath) => {
      // Night sky
      const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGradient.addColorStop(0, '#05050f');
      skyGradient.addColorStop(0.4, '#0a0a1a');
      skyGradient.addColorStop(0.7, '#0f0f28');
      skyGradient.addColorStop(1, '#151530');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars
      stars.forEach(star => star.draw(ctx, time));

      // Moon glow (subtle)
      const moonX = canvas.width * 0.8;
      const moonY = canvas.height * 0.15;
      const moonGlow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 120);
      moonGlow.addColorStop(0, `rgba(200, 210, 230, ${0.15 + breath * 0.05})`);
      moonGlow.addColorStop(0.3, 'rgba(150, 160, 180, 0.05)');
      moonGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(moonX, moonY, 120, 0, Math.PI * 2);
      ctx.fill();

      // Treeline silhouette
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      treelinePoints.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fillStyle = '#030308';
      ctx.fill();

      // Grass at bottom
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      for (let x = 0; x <= canvas.width; x += 4) {
        const sway = Math.sin(x * 0.08 + time * 0.0008) * 3;
        const grassHeight = 18 + Math.sin(x * 0.15) * 6 + sway;
        ctx.lineTo(x, canvas.height - grassHeight);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fillStyle = '#060610';
      ctx.fill();
    };

    // Attraction points
    const attractionPoints = [];

    let lastTime = Date.now();

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const now = Date.now();
      const dt = Math.min(now - lastTime, 50);
      lastTime = now;

      const elapsed = (now - startTime) / 1000;
      const breath = getBreathPhase(elapsed);
      const isInhaling = Math.sin(elapsed * BREATH_SPEED) > 0;

      // Breath sync - gather on inhale, sync glow on exhale
      if (isInhaling) {
        fireflies.forEach(fly => {
          fly.targetX += (canvas.width / 2 - fly.targetX) * 0.002 * breath;
          fly.targetY += (canvas.height / 2 - fly.targetY) * 0.002 * breath;
        });
      } else {
        // Sync flash phases slightly on exhale
        fireflies.forEach(fly => {
          fly.patternTime += (breath - 0.5) * 0.01;
        });
      }

      // Handle touch interactions
      touchPointsRef.current.forEach(point => {
        if (point.active) {
          if (!point.attracting) {
            attractionPoints.push({ x: point.x, y: point.y, strength: 1, active: true, id: point.id });
            point.attracting = true;
          }
          const ap = attractionPoints.find(a => a.id === point.id);
          if (ap) {
            ap.x = point.x;
            ap.y = point.y;
          }
        } else if (point.attracting) {
          const ap = attractionPoints.find(a => a.id === point.id);
          if (ap) ap.active = false;
          point.attracting = false;
        }
      });

      // Update attraction points
      for (let i = attractionPoints.length - 1; i >= 0; i--) {
        const ap = attractionPoints[i];
        if (!ap.active) {
          ap.strength *= 0.92;
          if (ap.strength < 0.02) {
            attractionPoints.splice(i, 1);
            continue;
          }
        }
        fireflies.forEach(fly => fly.attract(ap.x, ap.y, ap.strength));
      }

      // Draw environment
      drawEnvironment(now, breath);

      // Update and draw fireflies (sorted by depth for proper layering)
      fireflies.sort((a, b) => a.z - b.z);
      fireflies.forEach(fly => {
        fly.update(dt);
        fly.draw(ctx);
      });

      // Touch ripples
      drawRipples(ctx);

      // Breath indicator
      ctx.fillStyle = `rgba(180, 200, 150, ${0.25 + breath * 0.2})`;
      ctx.font = '14px "Jost", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isInhaling ? 'breathe in' : 'breathe out', canvas.width / 2, canvas.height - 35);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [currentMode, getInteractionInfluence, drawRipples]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2,
        cursor: 'pointer',
        background: '#000',
        touchAction: 'none',
      }}
      onClick={() => setShowUI(!showUI)}
      onMouseDown={handleInteractionStart}
      onMouseMove={handleInteractionMove}
      onMouseUp={handleInteractionEnd}
      onMouseLeave={handleInteractionEnd}
      onTouchStart={handleInteractionStart}
      onTouchMove={handleInteractionMove}
      onTouchEnd={handleInteractionEnd}
    >
      {/* Three.js container for geometry mode */}
      {currentMode === 'geometry' && (
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      )}

      {/* Canvas for 2D modes */}
      {currentMode !== 'geometry' && (
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      )}

      {/* Experience name toast - shows on swipe */}
      {showExperienceToast && !showUI && (
        <div style={{
          position: 'absolute',
          top: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(10px)',
          padding: '0.5rem 1rem',
          borderRadius: '20px',
          border: '1px solid rgba(127,219,202,0.2)',
          pointerEvents: 'none',
          animation: 'fadeInOut 1.5s ease-in-out',
        }}>
          <span style={{
            color: '#7FDBCA',
            fontSize: '0.75rem',
            fontFamily: '"Jost", sans-serif',
            letterSpacing: '0.1em',
          }}>
            {gazeExperiences.find(e => e.key === selectedExperience)?.name || ''}
          </span>
        </div>
      )}
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          15% { opacity: 1; transform: translateX(-50%) translateY(0); }
          85% { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
        }
      `}</style>

      {/* Experience selector */}
      {showUI && (
        <div style={{
          position: 'absolute',
          top: '3rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          alignItems: 'center',
          maxWidth: '95vw',
        }}>
          {/* Curated experiences - single row */}
          {!customMode && (
            <div style={{
              maxWidth: '90vw',
              overflowX: 'auto',
              overflowY: 'hidden',
              padding: '0.75rem 1rem',
              background: 'rgba(0,0,0,0.85)',
              borderRadius: '16px',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              WebkitOverflowScrolling: 'touch',
            }}>
              <div style={{ display: 'flex', gap: '0.5rem', whiteSpace: 'nowrap' }}>
                {gazeExperiences.map(exp => (
                  <button
                    key={exp.key}
                    onClick={(e) => { e.stopPropagation(); selectExperience(exp.key); }}
                    style={{
                      background: selectedExperience === exp.key && !customMode ? 'rgba(127,219,202,0.2)' : 'transparent',
                      border: selectedExperience === exp.key && !customMode ? '1px solid rgba(127,219,202,0.4)' : '1px solid rgba(255,255,255,0.08)',
                      color: selectedExperience === exp.key && !customMode ? '#7FDBCA' : 'rgba(255,255,255,0.5)',
                      padding: '0.5rem 0.9rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.7rem',
                      fontFamily: '"Jost", sans-serif',
                      flexShrink: 0,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {exp.name}
                  </button>
                ))}
                {/* Custom toggle */}
                <button
                  onClick={(e) => { e.stopPropagation(); setCustomMode(true); }}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'rgba(255,255,255,0.4)',
                    padding: '0.5rem 0.9rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.65rem',
                    fontFamily: '"Jost", sans-serif',
                    flexShrink: 0,
                    fontStyle: 'italic',
                  }}
                >
                  Custom...
                </button>
              </div>
            </div>
          )}

          {/* Custom mode - visual + breath selectors */}
          {customMode && (
            <>
              <div style={{
                maxWidth: '90vw',
                overflowX: 'auto',
                overflowY: 'hidden',
                padding: '0.6rem 0.8rem',
                background: 'rgba(0,0,0,0.85)',
                borderRadius: '12px',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                WebkitOverflowScrolling: 'touch',
              }}>
                <div style={{ display: 'flex', gap: '0.4rem', whiteSpace: 'nowrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginRight: '0.25rem' }}>Visual</span>
                  {gazeModes.map(mode => (
                    <button
                      key={mode.key}
                      onClick={(e) => { e.stopPropagation(); setCurrentMode(mode.key); }}
                      style={{
                        background: currentMode === mode.key ? 'rgba(127,219,202,0.2)' : 'transparent',
                        border: currentMode === mode.key ? '1px solid rgba(127,219,202,0.4)' : '1px solid rgba(255,255,255,0.06)',
                        color: currentMode === mode.key ? '#7FDBCA' : 'rgba(255,255,255,0.4)',
                        padding: '0.35rem 0.6rem',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '0.6rem',
                        fontFamily: '"Jost", sans-serif',
                        flexShrink: 0,
                      }}
                    >
                      {mode.name}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{
                maxWidth: '90vw',
                overflowX: 'auto',
                overflowY: 'hidden',
                padding: '0.5rem 0.7rem',
                background: 'rgba(0,0,0,0.75)',
                borderRadius: '10px',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(127,219,202,0.1)',
                WebkitOverflowScrolling: 'touch',
              }}>
                <div style={{ display: 'flex', gap: '0.35rem', whiteSpace: 'nowrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.5rem', color: 'rgba(127,219,202,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginRight: '0.25rem' }}>Breath</span>
                  {Object.entries(breathTechniques).map(([key, tech]) => (
                    <button
                      key={key}
                      onClick={(e) => { e.stopPropagation(); setSelectedTechnique(key); }}
                      style={{
                        background: selectedTechnique === key ? 'rgba(127,219,202,0.15)' : 'transparent',
                        border: selectedTechnique === key ? '1px solid rgba(127,219,202,0.3)' : '1px solid rgba(255,255,255,0.05)',
                        color: selectedTechnique === key ? '#7FDBCA' : 'rgba(255,255,255,0.35)',
                        padding: '0.3rem 0.55rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.55rem',
                        fontFamily: '"Jost", sans-serif',
                        flexShrink: 0,
                      }}
                    >
                      {tech.name}
                    </button>
                  ))}
                </div>
              </div>
              {/* Back to experiences */}
              <button
                onClick={(e) => { e.stopPropagation(); setCustomMode(false); }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.3)',
                  fontSize: '0.55rem',
                  fontFamily: '"Jost", sans-serif',
                  cursor: 'pointer',
                  padding: '0.3rem',
                }}
              >
                back to experiences
              </button>
            </>
          )}
        </div>
      )}


      {/* Minimal breath indicator - bottom right corner */}
      <div style={{
        position: 'absolute',
        bottom: '1.25rem',
        right: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        opacity: showUI ? 0 : 0.6,
        transition: 'opacity 0.4s ease',
        pointerEvents: 'none',
      }}>
        {/* Subtle pulse ring */}
        <div style={{
          width: `${12 + breathDisplay.phase * 16}px`,
          height: `${12 + breathDisplay.phase * 16}px`,
          borderRadius: '50%',
          background: 'transparent',
          border: `1.5px solid ${breathDisplay.isHolding ? 'rgba(255,215,100,0.5)' : 'rgba(127,219,202,0.4)'}`,
          transition: 'width 0.15s ease-out, height 0.15s ease-out, border-color 0.3s ease',
        }} />
        {/* Phase label - very subtle */}
        <div style={{
          color: breathDisplay.isHolding ? 'rgba(255, 215, 100, 0.6)' : 'rgba(127, 219, 202, 0.5)',
          fontSize: '0.55rem',
          fontFamily: '"Jost", sans-serif',
          letterSpacing: '0.1em',
          textTransform: 'lowercase',
          minWidth: '4rem',
        }}>
          {breathDisplay.phaseLabel.toLowerCase()}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SETTINGS
// ============================================================================

const defaultSettings = {
  theme: 'void',
  scrollSpeed: 1,
  depthEffect: true,
  particles: false,
  reducedMotion: false,
  breathMode: false,      // Quotes advance with breath
  autoAdvance: false,     // Auto-advance quotes
  autoAdvanceInterval: 20, // Seconds between quotes
};

const STORAGE_KEYS = {
  SAVED_QUOTES: 'philos_saved_quotes',
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

  // ============================================================================
  // BREATH SESSION STATE (for dedicated breathwork view)
  // ============================================================================

  const [breathSession, setBreathSession] = useState({
    technique: 'calm',
    isActive: false,
    isPaused: false,
    phase: 'inhale',
    phaseIndex: 0,
    phaseProgress: 0,  // 0-1 through current phase
    cycleCount: 0,
    sessionTime: 0,
    totalCycles: 10,
  });
  const breathSessionRef = useRef(null);
  const [showTechniqueMenu, setShowTechniqueMenu] = useState(false);

  // ============================================================================
  // BREATHING - The heartbeat of the app (ambient background)
  // Inhale: 5s (0→1), Exhale: 6s (1→0), Total cycle: 11s
  // ============================================================================

  const [breathPhase, setBreathPhase] = useState(0); // 0-1, where 1 is full inhale
  const [isInhaling, setIsInhaling] = useState(true);
  const breathCycleCount = useRef(0);

  useEffect(() => {
    const INHALE_DURATION = 5000;
    const EXHALE_DURATION = 6000;

    let animationFrame;
    let startTime = Date.now();
    let inhaling = true;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const duration = inhaling ? INHALE_DURATION : EXHALE_DURATION;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth easing
      const eased = inhaling
        ? 1 - Math.pow(1 - progress, 3)  // ease-out for inhale
        : Math.pow(1 - progress, 3);      // ease-in for exhale (reverse)

      const phase = inhaling ? eased : 1 - eased;
      setBreathPhase(phase);
      setIsInhaling(inhaling);

      if (progress >= 1) {
        // Switch breath direction
        inhaling = !inhaling;
        startTime = Date.now();

        // Count complete cycles (after full exhale)
        if (inhaling) {
          breathCycleCount.current++;
        }
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [settings.breathMode]);

  // ============================================================================
  // BREATH SESSION CONTROLS (for dedicated breathwork view)
  // ============================================================================

  const startBreathSession = useCallback((techniqueName) => {
    const technique = breathTechniques[techniqueName];
    if (!technique) return;

    setBreathSession({
      technique: techniqueName,
      isActive: true,
      isPaused: false,
      phase: technique.phases[0].name,
      phaseIndex: 0,
      phaseProgress: 0,
      cycleCount: 0,
      sessionTime: 0,
      totalCycles: 10,
    });
  }, []);

  const stopBreathSession = useCallback(() => {
    setBreathSession(prev => ({ ...prev, isActive: false, isPaused: false }));
    if (breathSessionRef.current) {
      cancelAnimationFrame(breathSessionRef.current);
    }
  }, []);

  const togglePauseBreathSession = useCallback(() => {
    setBreathSession(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  // Breath session animation loop
  useEffect(() => {
    if (!breathSession.isActive || breathSession.isPaused) {
      if (breathSessionRef.current) cancelAnimationFrame(breathSessionRef.current);
      return;
    }

    const technique = breathTechniques[breathSession.technique];
    if (!technique) return;

    let lastTime = Date.now();
    let phaseStartTime = Date.now();
    let currentPhaseIndex = breathSession.phaseIndex;
    let currentCycleCount = breathSession.cycleCount;
    let sessionStartTime = Date.now() - (breathSession.sessionTime * 1000);

    const animate = () => {
      const now = Date.now();
      const phase = technique.phases[currentPhaseIndex];
      const phaseDuration = phase.duration * 1000;
      const phaseElapsed = now - phaseStartTime;
      const phaseProgress = Math.min(phaseElapsed / phaseDuration, 1);

      // Update session time
      const sessionTime = (now - sessionStartTime) / 1000;

      // Check if phase complete
      if (phaseProgress >= 1) {
        currentPhaseIndex = (currentPhaseIndex + 1) % technique.phases.length;
        phaseStartTime = now;

        // Count cycle when we return to first phase
        if (currentPhaseIndex === 0) {
          currentCycleCount++;
        }
      }

      setBreathSession(prev => ({
        ...prev,
        phase: technique.phases[currentPhaseIndex].name,
        phaseIndex: currentPhaseIndex,
        phaseProgress: phaseProgress,
        cycleCount: currentCycleCount,
        sessionTime: Math.floor(sessionTime),
      }));

      breathSessionRef.current = requestAnimationFrame(animate);
    };

    breathSessionRef.current = requestAnimationFrame(animate);
    return () => {
      if (breathSessionRef.current) cancelAnimationFrame(breathSessionRef.current);
    };
  }, [breathSession.isActive, breathSession.isPaused, breathSession.technique]);

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

    // Slower, more meditative timing - like handwriting
    const getDelay = (char) => {
      if (char === ' ') return 50;
      if (['.', '—', '–'].includes(char)) return 400;  // Long pause for periods
      if ([',', ';', ':'].includes(char)) return 250;  // Medium pause
      if (['?', '!'].includes(char)) return 500;       // Longest pause
      return 55 + Math.random() * 35; // 55-90ms base speed
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

  // Breath mode: advance quote every 2 breath cycles (~22s)
  const lastBreathAdvance = useRef(0);
  useEffect(() => {
    if (!settings.breathMode || view !== 'scroll') return;

    const checkBreathAdvance = setInterval(() => {
      if (breathCycleCount.current >= lastBreathAdvance.current + 2) {
        lastBreathAdvance.current = breathCycleCount.current;
        goToQuote(1);
      }
    }, 1000);

    return () => clearInterval(checkBreathAdvance);
  }, [settings.breathMode, view, goToQuote]);

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


  // Visual transforms are now handled directly in applyTransforms via refs

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
        {/* Vignette */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
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
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)',
          zIndex: 100,
        }}>
          <h1
            onClick={() => { setView('scroll'); physicsRef.current.position = 0; physicsRef.current.velocity = 0; indexRef.current = 0; setCurrentIndex(0); }}
            style={{
              fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
              fontFamily: '"Jost", sans-serif',
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
              { key: 'gaze', icon: '◯', label: 'Gaze' },
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
          </nav>
        </header>

        {/* Main Scroll View */}
        {view === 'scroll' && currentQuote && (
          <main style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
            {/* Quote Card - emerges like smoke, fades during breath focus */}
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
                fontSize: 'clamp(1.6rem, 6vw, 3rem)',
                fontFamily: '"Jost", sans-serif',
                fontWeight: 500,
                lineHeight: 1.6,
                color: currentTheme.text,
                margin: 0,
                letterSpacing: '0.02em',
                textShadow: '0 2px 15px rgba(0,0,0,0.4)',
              }}>
                {currentQuote.text.slice(0, revealedChars)}
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
                    background: 'rgba(127, 219, 202, 0.15)',
                    borderRadius: '4px',
                    color: '#7FDBCA',
                    fontSize: '0.7rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    border: '1px solid rgba(127, 219, 202, 0.25)',
                  }}>
                    {currentQuote.school}
                  </span>
                  {currentQuote.themes && currentQuote.themes.slice(0, 2).map(theme => (
                    <span key={theme} style={{
                      padding: '0.25rem 0.6rem',
                      background: 'rgba(127, 219, 202, 0.1)',
                      borderRadius: '3px',
                      color: 'rgba(127, 219, 202, 0.7)',
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
                      color: isQuoteSaved(currentQuote) ? '#7FDBCA' : currentTheme.textMuted,
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
                </div>
              </div>
            </div>
          </main>
        )}

        {/* Breathe View */}
        {view === 'breathe' && (
          <main style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            background: breathSession.isActive
              ? breathTechniques[breathSession.technique]?.color?.[breathSession.phase] || currentTheme.bg
              : currentTheme.bg,
            transition: 'background 2s ease',
          }}>
            {/* Technique Selection (when not in session) */}
            {!breathSession.isActive && (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <h2 style={{
                  fontSize: '0.7rem',
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  color: currentTheme.textMuted,
                  marginBottom: '2rem',
                }}>
                  Choose Your Breath
                </h2>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  maxWidth: '320px',
                  margin: '0 auto',
                }}>
                  {Object.entries(breathTechniques).map(([key, tech]) => (
                    <button
                      key={key}
                      onClick={() => startBreathSession(key)}
                      style={{
                        background: currentTheme.cardBg,
                        border: `1px solid ${currentTheme.border}`,
                        borderRadius: '12px',
                        padding: '1.25rem 1.5rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <div style={{
                        fontSize: '1rem',
                        fontFamily: '"Jost", sans-serif',
                        color: currentTheme.text,
                        marginBottom: '0.25rem',
                      }}>
                        {tech.name}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: currentTheme.textMuted,
                        fontFamily: '"Jost", sans-serif',
                      }}>
                        {tech.description}
                      </div>
                      <div style={{
                        fontSize: '0.65rem',
                        color: currentTheme.textMuted,
                        marginTop: '0.5rem',
                        opacity: 0.7,
                      }}>
                        {tech.phases.map(p => `${p.label} ${p.duration}s`).join(' → ')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Active Breath Session */}
            {breathSession.isActive && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                position: 'relative',
              }}>
                {/* Central Breath Circle */}
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {/* Outer glow */}
                  <div style={{
                    position: 'absolute',
                    width: `${120 + breathSession.phaseProgress * 80}px`,
                    height: `${120 + breathSession.phaseProgress * 80}px`,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${currentTheme.accent}15 0%, transparent 70%)`,
                    transform: breathSession.phase === 'inhale' || breathSession.phase === 'holdFull'
                      ? `scale(${0.8 + breathSession.phaseProgress * 0.6})`
                      : `scale(${1.4 - breathSession.phaseProgress * 0.6})`,
                    transition: 'transform 0.1s linear',
                  }} />

                  {/* Main circle */}
                  <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    border: `2px solid ${currentTheme.accent}`,
                    opacity: 0.6 + breathSession.phaseProgress * 0.3,
                    transform: breathSession.phase === 'inhale' || breathSession.phase === 'holdFull'
                      ? `scale(${0.7 + breathSession.phaseProgress * 0.6})`
                      : `scale(${1.3 - breathSession.phaseProgress * 0.6})`,
                    transition: 'transform 0.1s linear, opacity 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {/* Inner circle */}
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: `${currentTheme.accent}30`,
                      transform: breathSession.phase === 'inhale' || breathSession.phase === 'holdFull'
                        ? `scale(${0.6 + breathSession.phaseProgress * 0.8})`
                        : `scale(${1.4 - breathSession.phaseProgress * 0.8})`,
                      transition: 'transform 0.1s linear',
                    }} />
                  </div>
                </div>

                {/* Phase Label */}
                <div style={{
                  marginTop: '3rem',
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontSize: '1.5rem',
                    fontFamily: '"Jost", sans-serif',
                    color: currentTheme.text,
                    opacity: 0.9,
                    letterSpacing: '0.05em',
                  }}>
                    {breathTechniques[breathSession.technique]?.phases[breathSession.phaseIndex]?.label}
                  </div>

                  {/* Progress bar for current phase */}
                  <div style={{
                    width: '200px',
                    height: '2px',
                    background: currentTheme.border,
                    borderRadius: '1px',
                    marginTop: '1rem',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${breathSession.phaseProgress * 100}%`,
                      height: '100%',
                      background: currentTheme.accent,
                      transition: 'width 0.1s linear',
                    }} />
                  </div>
                </div>

                {/* Controls */}
                <div style={{
                  position: 'absolute',
                  bottom: '2rem',
                  display: 'flex',
                  gap: '1rem',
                }}>
                  <button
                    onClick={togglePauseBreathSession}
                    style={{
                      background: currentTheme.cardBg,
                      border: `1px solid ${currentTheme.border}`,
                      color: currentTheme.text,
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontFamily: '"Jost", sans-serif',
                    }}
                  >
                    {breathSession.isPaused ? '▶ Resume' : '⏸ Pause'}
                  </button>
                  <button
                    onClick={stopBreathSession}
                    style={{
                      background: 'transparent',
                      border: `1px solid ${currentTheme.border}`,
                      color: currentTheme.textMuted,
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontFamily: '"Jost", sans-serif',
                    }}
                  >
                    ✕ End
                  </button>
                </div>
              </div>
            )}
          </main>
        )}

        {/* Gaze View - Sacred Geometry */}
        {view === 'gaze' && (
          <GazeMode theme={currentTheme} />
        )}

        {/* Filter View */}
        {view === 'filter' && (
          <main style={{ position: 'absolute', top: '80px', left: 0, right: 0, bottom: 0, zIndex: 2, padding: '2rem', overflowY: 'auto' }}>
            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
              {/* Schools */}
              <h2 style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: currentTheme.textMuted, marginBottom: '1.5rem', textAlign: 'center' }}>Filter by School of Thought</h2>
              {selectedSchools.size > 0 && (
                <button onClick={() => setSelectedSchools(new Set())} style={{ display: 'block', margin: '0 auto 1.5rem', background: 'none', border: 'none', color: '#7FDBCA', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}>Clear school filters</button>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', marginBottom: '2.5rem' }}>
                {allSchools.map(school => {
                  const isSelected = selectedSchools.has(school);
                  const color = '#7FDBCA';
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
                <button onClick={() => setSelectedThemes(new Set())} style={{ display: 'block', margin: '0 auto 1.5rem', background: 'none', border: 'none', color: '#7FDBCA', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}>Clear theme filters</button>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
                {allThemes.map(theme => {
                  const isSelected = selectedThemes.has(theme);
                  const color = '#7FDBCA';
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
                    <blockquote style={{ fontSize: '1.1rem', fontFamily: '"Jost", sans-serif', fontStyle: 'italic', lineHeight: 1.6, color: currentTheme.text, margin: 0 }}>"{quote.text}"</blockquote>
                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: currentTheme.textMuted, fontWeight: 500 }}>{quote.author}</div>
                        <span style={{ display: 'inline-block', marginTop: '0.35rem', padding: '0.2rem 0.5rem', background: 'rgba(127, 219, 202, 0.15)', borderRadius: '3px', color: '#7FDBCA', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{quote.school}</span>
                      </div>
                      <button onClick={() => toggleSave(quote)} style={{ background: 'none', border: `1px solid ${currentTheme.border}`, color: '#7FDBCA', padding: '0.4rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>✕</button>
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

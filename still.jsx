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

  // SPIRITUAL TEACHERS
  // Ram Dass
  { text: "Be here now.", author: "Ram Dass", school: "Spiritual", era: "20th Century", themes: ["wisdom", "joy"] },
  { text: "The next message you need is always right where you are.", author: "Ram Dass", school: "Spiritual", era: "20th Century", themes: ["wisdom", "meaning"] },
  { text: "We're all just walking each other home.", author: "Ram Dass", school: "Spiritual", era: "20th Century", themes: ["love", "meaning"] },
  { text: "The heart surrenders everything to the moment. The mind judges and holds back.", author: "Ram Dass", school: "Spiritual", era: "20th Century", themes: ["love", "wisdom"] },
  { text: "As long as you have certain desires about how it ought to be you can't see how it is.", author: "Ram Dass", school: "Spiritual", era: "20th Century", themes: ["wisdom", "freedom"] },
  { text: "The resistance to the unpleasant situation is the root of suffering.", author: "Ram Dass", school: "Spiritual", era: "20th Century", themes: ["suffering", "wisdom"] },
  { text: "I would like my life to be a statement of love and compassion—and where it isn't, that's where my work lies.", author: "Ram Dass", school: "Spiritual", era: "20th Century", themes: ["love", "self"] },
  { text: "The game is not about becoming somebody, it's about becoming nobody.", author: "Ram Dass", school: "Spiritual", era: "20th Century", themes: ["self", "freedom"] },
  { text: "Learn to watch your drama unfold while at the same time knowing you are more than your drama.", author: "Ram Dass", school: "Spiritual", era: "20th Century", themes: ["self", "wisdom"] },
  { text: "Everything changes once we identify with being the witness to the story, instead of the actor in it.", author: "Ram Dass", school: "Spiritual", era: "20th Century", themes: ["self", "freedom"] },
  { text: "Suffering is part of our training program for becoming wise.", author: "Ram Dass", school: "Spiritual", era: "20th Century", themes: ["suffering", "wisdom"] },
  { text: "Our whole spiritual transformation brings us to the point where we realize that in our own being, we are enough.", author: "Ram Dass", school: "Spiritual", era: "20th Century", themes: ["self", "meaning"] },

  // Eckhart Tolle
  { text: "Realize deeply that the present moment is all you ever have.", author: "Eckhart Tolle", school: "Spiritual", era: "21st Century", themes: ["wisdom", "joy"] },
  { text: "Life is the dancer and you are the dance.", author: "Eckhart Tolle", school: "Spiritual", era: "21st Century", themes: ["meaning", "joy"] },
  { text: "The primary cause of unhappiness is never the situation but your thoughts about it.", author: "Eckhart Tolle", school: "Spiritual", era: "21st Century", themes: ["suffering", "wisdom"] },
  { text: "Whatever you fight, you strengthen, and what you resist, persists.", author: "Eckhart Tolle", school: "Spiritual", era: "21st Century", themes: ["wisdom", "freedom"] },
  { text: "You are not your thoughts. You are the awareness behind the thoughts.", author: "Eckhart Tolle", school: "Spiritual", era: "21st Century", themes: ["self", "truth"] },
  { text: "Acknowledging the good that you already have in your life is the foundation for all abundance.", author: "Eckhart Tolle", school: "Spiritual", era: "21st Century", themes: ["joy", "wisdom"] },
  { text: "The moment you become aware of the ego in you, it is strictly speaking no longer the ego.", author: "Eckhart Tolle", school: "Spiritual", era: "21st Century", themes: ["self", "wisdom"] },
  { text: "You find peace not by rearranging the circumstances of your life, but by realizing who you are at the deepest level.", author: "Eckhart Tolle", school: "Spiritual", era: "21st Century", themes: ["self", "joy"] },
  { text: "Give up defining yourself — to yourself or to others. You won't die. You will come to life.", author: "Eckhart Tolle", school: "Spiritual", era: "21st Century", themes: ["self", "freedom"] },
  { text: "What a liberation to realize that the voice in my head is not who I am.", author: "Eckhart Tolle", school: "Spiritual", era: "21st Century", themes: ["self", "freedom"] },

  // Pema Chödrön
  { text: "You are the sky. Everything else is just the weather.", author: "Pema Chödrön", school: "Spiritual", era: "20th Century", themes: ["self", "wisdom"] },
  { text: "Nothing ever goes away until it has taught us what we need to know.", author: "Pema Chödrön", school: "Spiritual", era: "20th Century", themes: ["suffering", "wisdom"] },
  { text: "The most fundamental aggression to ourselves is to remain ignorant by not having the courage to look at ourselves honestly.", author: "Pema Chödrön", school: "Spiritual", era: "20th Century", themes: ["self", "courage"] },
  { text: "Fear is a natural reaction to moving closer to the truth.", author: "Pema Chödrön", school: "Spiritual", era: "20th Century", themes: ["courage", "truth"] },
  { text: "Compassion is not a relationship between the healer and the wounded. It's a relationship between equals.", author: "Pema Chödrön", school: "Spiritual", era: "20th Century", themes: ["love", "wisdom"] },
  { text: "To be fully alive, fully human, and completely awake is to be continually thrown out of the nest.", author: "Pema Chödrön", school: "Spiritual", era: "20th Century", themes: ["courage", "change"] },
  { text: "The only reason we don't open our hearts and minds to other people is that they trigger confusion in us.", author: "Pema Chödrön", school: "Spiritual", era: "20th Century", themes: ["love", "self"] },
  { text: "Rather than letting our negativity get the better of us, we could acknowledge that right now we feel like a piece of shit and not be squeamish about taking a good look.", author: "Pema Chödrön", school: "Spiritual", era: "20th Century", themes: ["self", "courage"] },

  // Mooji
  { text: "Step into the fire of self-discovery. This fire will not burn you, it will only burn what you are not.", author: "Mooji", school: "Spiritual", era: "21st Century", themes: ["self", "change"] },
  { text: "Don't be a storehouse of memories. Leave past, future and even present thoughts behind.", author: "Mooji", school: "Spiritual", era: "21st Century", themes: ["freedom", "wisdom"] },
  { text: "The mind is like a parachute. It works best when it's open.", author: "Mooji", school: "Spiritual", era: "21st Century", themes: ["wisdom", "freedom"] },
  { text: "Life cannot be against you, for you are life itself.", author: "Mooji", school: "Spiritual", era: "21st Century", themes: ["meaning", "self"] },
  { text: "The greatest healing would be to wake up from what we are not.", author: "Mooji", school: "Spiritual", era: "21st Century", themes: ["self", "truth"] },

  // Adyashanti
  { text: "Enlightenment is a destructive process. It has nothing to do with becoming better or being happier. Enlightenment is the crumbling away of untruth.", author: "Adyashanti", school: "Spiritual", era: "21st Century", themes: ["truth", "change"] },
  { text: "The biggest embrace of love you'll ever make is to embrace yourself completely.", author: "Adyashanti", school: "Spiritual", era: "21st Century", themes: ["love", "self"] },
  { text: "We realize that who we are is not the story of me, but the awakeness that's aware of everything.", author: "Adyashanti", school: "Spiritual", era: "21st Century", themes: ["self", "truth"] },
  { text: "The question is not how to get enlightened but rather how to stop unenlightening yourself.", author: "Adyashanti", school: "Spiritual", era: "21st Century", themes: ["wisdom", "self"] },

  // Jack Kornfield
  { text: "In the end, just three things matter: How well we have lived. How well we have loved. How well we have learned to let go.", author: "Jack Kornfield", school: "Spiritual", era: "20th Century", themes: ["meaning", "love"] },
  { text: "The things that matter most in our lives are not fantastic or grand. They are moments when we touch one another.", author: "Jack Kornfield", school: "Spiritual", era: "20th Century", themes: ["love", "meaning"] },
  { text: "Forgiveness is giving up all hope of a better past.", author: "Jack Kornfield", school: "Spiritual", era: "20th Century", themes: ["freedom", "wisdom"] },
  { text: "In a moment of mindfulness, we observe the flow of thoughts without being caught by them.", author: "Jack Kornfield", school: "Spiritual", era: "20th Century", themes: ["wisdom", "self"] },

  // Nisargadatta Maharaj
  { text: "Wisdom tells me I am nothing. Love tells me I am everything. Between the two my life flows.", author: "Nisargadatta Maharaj", school: "Spiritual", era: "20th Century", themes: ["wisdom", "love"] },
  { text: "The mind creates the abyss, the heart crosses it.", author: "Nisargadatta Maharaj", school: "Spiritual", era: "20th Century", themes: ["love", "wisdom"] },
  { text: "Once you realize that all comes from within, that the world in which you live is not projected onto you but by you.", author: "Nisargadatta Maharaj", school: "Spiritual", era: "20th Century", themes: ["self", "truth"] },
  { text: "There is nothing to practice. To know yourself, be yourself.", author: "Nisargadatta Maharaj", school: "Spiritual", era: "20th Century", themes: ["self", "wisdom"] },

  // Ramana Maharshi
  { text: "Your own Self-Realization is the greatest service you can render the world.", author: "Ramana Maharshi", school: "Spiritual", era: "20th Century", themes: ["self", "meaning"] },
  { text: "Happiness is your nature. It is not wrong to desire it. What is wrong is seeking it outside when it is inside.", author: "Ramana Maharshi", school: "Spiritual", era: "20th Century", themes: ["joy", "self"] },
  { text: "The question 'Who am I?' is not really meant to get an answer, the question 'Who am I?' is meant to dissolve the questioner.", author: "Ramana Maharshi", school: "Spiritual", era: "20th Century", themes: ["self", "truth"] },
  { text: "No one succeeds without effort. Mind control is not your birthright. Those who succeed owe their success to perseverance.", author: "Ramana Maharshi", school: "Spiritual", era: "20th Century", themes: ["courage", "wisdom"] },

  // Paramahansa Yogananda
  { text: "The season of failure is the best time for sowing the seeds of success.", author: "Paramahansa Yogananda", school: "Spiritual", era: "20th Century", themes: ["courage", "change"] },
  { text: "Live quietly in the moment and see the beauty of all before you. The future will take care of itself.", author: "Paramahansa Yogananda", school: "Spiritual", era: "20th Century", themes: ["joy", "wisdom"] },
  { text: "There is a magnet in your heart that will attract true friends.", author: "Paramahansa Yogananda", school: "Spiritual", era: "20th Century", themes: ["love", "truth"] },
  { text: "Kindness is the light that dissolves all walls between souls.", author: "Paramahansa Yogananda", school: "Spiritual", era: "20th Century", themes: ["love", "wisdom"] },

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

  // AYYA KHEMA (Theravada Buddhism)
  { text: "The only way to have peace is to let go of expecting anything.", author: "Ayya Khema", school: "Buddhism", era: "20th Century", themes: ["freedom", "joy"] },
  { text: "We cannot change the outer world, but we can change our inner world.", author: "Ayya Khema", school: "Buddhism", era: "20th Century", themes: ["self", "wisdom"] },
  { text: "Meditation is not about feeling a certain way. It's about feeling the way you feel.", author: "Ayya Khema", school: "Buddhism", era: "20th Century", themes: ["truth", "self"] },
  { text: "The mind that is not baffled is not employed. The impeded stream is the one that sings.", author: "Ayya Khema", school: "Buddhism", era: "20th Century", themes: ["suffering", "wisdom"] },
  { text: "There is no enlightenment outside of daily life.", author: "Ayya Khema", school: "Buddhism", era: "20th Century", themes: ["meaning", "truth"] },
  { text: "Letting go is the lesson. Letting go is always the lesson.", author: "Ayya Khema", school: "Buddhism", era: "20th Century", themes: ["freedom", "change"] },
  { text: "The ego is nothing other than the focus of conscious attention.", author: "Ayya Khema", school: "Buddhism", era: "20th Century", themes: ["self", "truth"] },
  { text: "Peace is not the absence of conflict, but the ability to cope with it.", author: "Ayya Khema", school: "Buddhism", era: "20th Century", themes: ["courage", "joy"] },

  // PEMA CHÖDRÖN (Tibetan Buddhism)
  { text: "You are the sky. Everything else is just the weather.", author: "Pema Chödrön", school: "Buddhism", era: "20th Century", themes: ["self", "change"] },
  { text: "Nothing ever goes away until it has taught us what we need to know.", author: "Pema Chödrön", school: "Buddhism", era: "20th Century", themes: ["suffering", "wisdom"] },
  { text: "The most fundamental aggression to ourselves is to remain ignorant by not having the courage to look at ourselves honestly.", author: "Pema Chödrön", school: "Buddhism", era: "20th Century", themes: ["courage", "truth"] },
  { text: "Fear is a natural reaction to moving closer to the truth.", author: "Pema Chödrön", school: "Buddhism", era: "20th Century", themes: ["courage", "truth"] },
  { text: "To be fully alive, fully human, and completely awake is to be continually thrown out of the nest.", author: "Pema Chödrön", school: "Buddhism", era: "20th Century", themes: ["change", "courage"] },
  { text: "Compassion is not a relationship between the healer and the wounded. It's a relationship between equals.", author: "Pema Chödrön", school: "Buddhism", era: "20th Century", themes: ["love", "wisdom"] },
  { text: "Only to the extent that we expose ourselves over and over to annihilation can that which is indestructible in us be found.", author: "Pema Chödrön", school: "Buddhism", era: "20th Century", themes: ["courage", "self"] },
  { text: "The healing comes from letting there be room for all of this to happen: room for grief, for relief, for misery, for joy.", author: "Pema Chödrön", school: "Buddhism", era: "20th Century", themes: ["suffering", "freedom"] },
  { text: "So even if the hot loneliness is there, and for 1.6 seconds we sit with that restlessness when yesterday we couldn't sit for even one—that's the journey of the warrior.", author: "Pema Chödrön", school: "Buddhism", era: "20th Century", themes: ["courage", "self"] },
  { text: "When you begin to touch your heart or let your heart be touched, you begin to discover that it's bottomless.", author: "Pema Chödrön", school: "Buddhism", era: "20th Century", themes: ["love", "self"] },

  // AJAHN CHAH (Thai Forest Tradition)
  { text: "If you let go a little, you will have a little peace. If you let go a lot, you will have a lot of peace.", author: "Ajahn Chah", school: "Buddhism", era: "20th Century", themes: ["freedom", "joy"] },
  { text: "Looking for peace is like looking for a turtle with a mustache. You won't be able to find it. But when your heart is ready, peace will come looking for you.", author: "Ajahn Chah", school: "Buddhism", era: "20th Century", themes: ["joy", "wisdom"] },
  { text: "Do not try to become anything. Do not make yourself into anything. Do not be a meditator. Do not become enlightened.", author: "Ajahn Chah", school: "Buddhism", era: "20th Century", themes: ["self", "freedom"] },
  { text: "If you want to understand suffering, you have to look into the nature of the mind.", author: "Ajahn Chah", school: "Buddhism", era: "20th Century", themes: ["suffering", "wisdom"] },
  { text: "Read yourself, not books. Truth is not outside; it's within.", author: "Ajahn Chah", school: "Buddhism", era: "20th Century", themes: ["truth", "self"] },
  { text: "The heart of the path is quite simple: do not be attached to anything.", author: "Ajahn Chah", school: "Buddhism", era: "20th Century", themes: ["freedom", "wisdom"] },
  { text: "We don't meditate to see heaven, but to end suffering.", author: "Ajahn Chah", school: "Buddhism", era: "20th Century", themes: ["suffering", "meaning"] },

  // SHARON SALZBERG (Insight Meditation)
  { text: "You yourself, as much as anybody in the entire universe, deserve your love and affection.", author: "Sharon Salzberg", school: "Buddhism", era: "20th Century", themes: ["love", "self"] },
  { text: "Mindfulness isn't difficult. What's difficult is to remember to be mindful.", author: "Sharon Salzberg", school: "Buddhism", era: "20th Century", themes: ["wisdom", "self"] },
  { text: "The difference between misery and happiness depends on what we do with our attention.", author: "Sharon Salzberg", school: "Buddhism", era: "20th Century", themes: ["joy", "self"] },
  { text: "Life is like an ever-shifting kaleidoscope — a slight change, and all patterns alter.", author: "Sharon Salzberg", school: "Buddhism", era: "20th Century", themes: ["change", "truth"] },
  { text: "Each decision we make, each action we take, is born out of an intention.", author: "Sharon Salzberg", school: "Buddhism", era: "20th Century", themes: ["meaning", "self"] },
  { text: "Faith is not a commodity we either have or don't have—it is an inner quality that unfolds as we learn to trust our own deepest experience.", author: "Sharon Salzberg", school: "Buddhism", era: "20th Century", themes: ["courage", "truth"] },

  // JACK KORNFIELD (Insight Meditation)
  { text: "In the end, just three things matter: How well we have lived. How well we have loved. How well we have learned to let go.", author: "Jack Kornfield", school: "Buddhism", era: "20th Century", themes: ["death", "love"] },
  { text: "The things that matter most in our lives are not fantastic or grand. They are moments when we touch one another.", author: "Jack Kornfield", school: "Buddhism", era: "20th Century", themes: ["love", "meaning"] },
  { text: "In a moment of mindfulness, we are not only more aware, we are more compassionate.", author: "Jack Kornfield", school: "Buddhism", era: "20th Century", themes: ["love", "wisdom"] },
  { text: "The art of attention is to quiet the restless mind.", author: "Jack Kornfield", school: "Buddhism", era: "20th Century", themes: ["self", "wisdom"] },
  { text: "Even in the midst of suffering, there is the possibility of finding peace.", author: "Jack Kornfield", school: "Buddhism", era: "20th Century", themes: ["suffering", "joy"] },
  { text: "Forgiveness does not mean we will forget, nor does it mean we condone the wrong. It means we let go of the pain.", author: "Jack Kornfield", school: "Buddhism", era: "20th Century", themes: ["freedom", "suffering"] },

  // TARA BRACH (Insight Meditation)
  { text: "The boundary to what we can accept is the boundary to our freedom.", author: "Tara Brach", school: "Buddhism", era: "21st Century", themes: ["freedom", "truth"] },
  { text: "Perhaps the biggest tragedy of our lives is that freedom is possible, yet we can pass our years trapped in the same old patterns.", author: "Tara Brach", school: "Buddhism", era: "21st Century", themes: ["freedom", "change"] },
  { text: "Radical acceptance is the willingness to experience ourselves and our lives as it is.", author: "Tara Brach", school: "Buddhism", era: "21st Century", themes: ["truth", "self"] },
  { text: "Feeling compassion for ourselves in no way releases us from responsibility for our actions. Rather, it releases us from the self-hatred that prevents us from responding to our life with clarity and balance.", author: "Tara Brach", school: "Buddhism", era: "21st Century", themes: ["love", "self"] },
  { text: "We are uncomfortable because everything in our life keeps changing.", author: "Tara Brach", school: "Buddhism", era: "21st Century", themes: ["change", "suffering"] },
  { text: "What would it be like if I could accept life—accept this moment—exactly as it is?", author: "Tara Brach", school: "Buddhism", era: "21st Century", themes: ["freedom", "joy"] },

  // RAM DASS (Western Buddhism/Hinduism)
  { text: "Be here now.", author: "Ram Dass", school: "Eastern Philosophy", era: "20th Century", themes: ["wisdom", "joy"] },
  { text: "The quieter you become, the more you can hear.", author: "Ram Dass", school: "Eastern Philosophy", era: "20th Century", themes: ["wisdom", "self"] },
  { text: "We're all just walking each other home.", author: "Ram Dass", school: "Eastern Philosophy", era: "20th Century", themes: ["love", "death"] },
  { text: "The heart surrenders everything to the moment. The mind judges and holds back.", author: "Ram Dass", school: "Eastern Philosophy", era: "20th Century", themes: ["love", "self"] },
  { text: "Suffering is part of our training program for becoming wise.", author: "Ram Dass", school: "Eastern Philosophy", era: "20th Century", themes: ["suffering", "wisdom"] },
  { text: "The next message you need is always right where you are.", author: "Ram Dass", school: "Eastern Philosophy", era: "20th Century", themes: ["truth", "meaning"] },
  { text: "As long as you have certain desires about how it ought to be you can't see how it is.", author: "Ram Dass", school: "Eastern Philosophy", era: "20th Century", themes: ["truth", "freedom"] },

  // ADYASHANTI (Non-dual)
  { text: "Enlightenment is a destructive process. It has nothing to do with becoming better or being happier. It is the crumbling away of untruth.", author: "Adyashanti", school: "Eastern Philosophy", era: "21st Century", themes: ["truth", "change"] },
  { text: "The Truth is the only thing you'll ever run into that has no agenda.", author: "Adyashanti", school: "Eastern Philosophy", era: "21st Century", themes: ["truth", "freedom"] },
  { text: "When you rest in quietness and your image of yourself fades, and your image of the world fades, and your ideas of others fade, what's left?", author: "Adyashanti", school: "Eastern Philosophy", era: "21st Century", themes: ["self", "truth"] },
  { text: "Do not be attached to the outcome of your practice; be attached only to the practice itself.", author: "Adyashanti", school: "Eastern Philosophy", era: "21st Century", themes: ["wisdom", "freedom"] },
  { text: "The separate self dissolves when you realize it never existed in the first place.", author: "Adyashanti", school: "Eastern Philosophy", era: "21st Century", themes: ["self", "truth"] },

  // S.N. GOENKA (Vipassana)
  { text: "The entire path is nothing but learning to observe the reality of this moment.", author: "S.N. Goenka", school: "Buddhism", era: "20th Century", themes: ["wisdom", "truth"] },
  { text: "Remain equanimous. Understanding the true nature of this moment, this too will pass.", author: "S.N. Goenka", school: "Buddhism", era: "20th Century", themes: ["change", "wisdom"] },
  { text: "The only conversion involved in Vipassana is from misery to happiness, from bondage to liberation.", author: "S.N. Goenka", school: "Buddhism", era: "20th Century", themes: ["freedom", "joy"] },
  { text: "Learn to use meditation in daily life, that is the real work.", author: "S.N. Goenka", school: "Buddhism", era: "20th Century", themes: ["meaning", "wisdom"] },

  // DESERT FATHERS & CHRISTIAN MYSTICS
  { text: "Sit in your cell and your cell will teach you everything.", author: "Desert Fathers", school: "Christian Mysticism", era: "4th Century", themes: ["wisdom", "self"] },
  { text: "A man who keeps death before his eyes will at all times overcome his cowardliness.", author: "Abba Anthony", school: "Christian Mysticism", era: "4th Century", themes: ["courage", "truth"] },
  { text: "The soul that walks in love neither tires others nor grows tired.", author: "St. John of the Cross", school: "Christian Mysticism", era: "16th Century", themes: ["love", "joy"] },
  { text: "In the evening of life, we will be judged on love alone.", author: "St. John of the Cross", school: "Christian Mysticism", era: "16th Century", themes: ["love", "meaning"] },
  { text: "All shall be well, and all shall be well, and all manner of thing shall be well.", author: "Julian of Norwich", school: "Christian Mysticism", era: "14th Century", themes: ["courage", "truth"] },
  { text: "Be still and know.", author: "Psalm 46:10", school: "Judeo-Christian", era: "Ancient", themes: ["wisdom", "truth"] },
  { text: "The wound is the place where the Light enters you.", author: "Rumi", school: "Sufism", era: "13th Century", themes: ["suffering", "truth"] },
  { text: "What you seek is seeking you.", author: "Rumi", school: "Sufism", era: "13th Century", themes: ["meaning", "love"] },
  { text: "Let yourself be silently drawn by the strange pull of what you really love.", author: "Rumi", school: "Sufism", era: "13th Century", themes: ["love", "meaning"] },
  { text: "Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.", author: "Rumi", school: "Sufism", era: "13th Century", themes: ["wisdom", "change"] },
  { text: "Wear gratitude like a cloak and it will feed every corner of your life.", author: "Rumi", school: "Sufism", era: "13th Century", themes: ["joy", "wisdom"] },
  { text: "Set your life on fire. Seek those who fan your flames.", author: "Rumi", school: "Sufism", era: "13th Century", themes: ["love", "courage"] },

  // JEWISH WISDOM
  { text: "If I am not for myself, who will be for me? If I am only for myself, what am I? And if not now, when?", author: "Hillel the Elder", school: "Jewish Philosophy", era: "1st Century BCE", themes: ["self", "meaning"] },
  { text: "We do not see things as they are, we see them as we are.", author: "Talmud", school: "Jewish Philosophy", era: "Ancient", themes: ["wisdom", "truth"] },
  { text: "It is not your responsibility to finish the work, but neither are you free to desist from it.", author: "Rabbi Tarfon", school: "Jewish Philosophy", era: "2nd Century", themes: ["meaning", "courage"] },

  // HINDU & VEDANTIC
  { text: "When meditation is mastered, the mind is unwavering like the flame of a lamp in a windless place.", author: "Bhagavad Gita", school: "Hinduism", era: "Ancient", themes: ["wisdom", "self"] },
  { text: "You have the right to work, but never to the fruit of work.", author: "Bhagavad Gita", school: "Hinduism", era: "Ancient", themes: ["wisdom", "freedom"] },
  { text: "The Self is everywhere. Bright is the Self, indivisible, untouched by sin, wise, transcendent.", author: "Isha Upanishad", school: "Hinduism", era: "Ancient", themes: ["truth", "self"] },
  { text: "From the unreal lead me to the real. From darkness lead me to light.", author: "Brihadaranyaka Upanishad", school: "Hinduism", era: "Ancient", themes: ["truth", "courage"] },

  // MORE STOICS
  { text: "We suffer more often in imagination than in reality.", author: "Seneca", school: "Stoicism", era: "1st Century", themes: ["suffering", "wisdom"] },
  { text: "True happiness is to enjoy the present, without anxious dependence upon the future.", author: "Seneca", school: "Stoicism", era: "1st Century", themes: ["joy", "wisdom"] },
  { text: "Luck is what happens when preparation meets opportunity.", author: "Seneca", school: "Stoicism", era: "1st Century", themes: ["courage", "wisdom"] },
  { text: "It is not that we have a short time to live, but that we waste a lot of it.", author: "Seneca", school: "Stoicism", era: "1st Century", themes: ["meaning", "wisdom"] },
  { text: "Associate with people who are likely to improve you.", author: "Seneca", school: "Stoicism", era: "1st Century", themes: ["love", "wisdom"] },
  { text: "If a man knows not to which port he sails, no wind is favorable.", author: "Seneca", school: "Stoicism", era: "1st Century", themes: ["meaning", "truth"] },
  { text: "The impediment to action advances action. What stands in the way becomes the way.", author: "Marcus Aurelius", school: "Stoicism", era: "2nd Century", themes: ["courage", "wisdom"] },
  { text: "Accept the things to which fate binds you, and love the people with whom fate brings you together.", author: "Marcus Aurelius", school: "Stoicism", era: "2nd Century", themes: ["love", "meaning"] },
  { text: "How much time he gains who does not look to see what his neighbor says or does or thinks.", author: "Marcus Aurelius", school: "Stoicism", era: "2nd Century", themes: ["freedom", "self"] },

  // CONTEMPORARY WISDOM
  { text: "Between stimulus and response there is a space. In that space is our power to choose our response.", author: "Viktor Frankl", school: "Existentialism", era: "20th Century", themes: ["freedom", "wisdom"] },
  { text: "When we are no longer able to change a situation, we are challenged to change ourselves.", author: "Viktor Frankl", school: "Existentialism", era: "20th Century", themes: ["courage", "change"] },
  { text: "Everything can be taken from a man but one thing: the last of human freedoms—to choose one's attitude.", author: "Viktor Frankl", school: "Existentialism", era: "20th Century", themes: ["freedom", "courage"] },
  { text: "In some ways suffering ceases to be suffering at the moment it finds a meaning.", author: "Viktor Frankl", school: "Existentialism", era: "20th Century", themes: ["suffering", "meaning"] },
  { text: "What is to give light must endure burning.", author: "Viktor Frankl", school: "Existentialism", era: "20th Century", themes: ["suffering", "meaning"] },
  { text: "The one thing you can't take away from me is the way I choose to respond to what you do to me.", author: "Viktor Frankl", school: "Existentialism", era: "20th Century", themes: ["freedom", "courage"] },
  { text: "Courage is not the absence of fear, but rather the judgment that something else is more important than fear.", author: "Ambrose Redmoon", school: "Contemporary", era: "20th Century", themes: ["courage", "meaning"] },
  { text: "The cave you fear to enter holds the treasure you seek.", author: "Joseph Campbell", school: "Mythology", era: "20th Century", themes: ["courage", "truth"] },
  { text: "Follow your bliss and the universe will open doors where there were only walls.", author: "Joseph Campbell", school: "Mythology", era: "20th Century", themes: ["joy", "meaning"] },
  { text: "We must be willing to let go of the life we planned so as to have the life that is waiting for us.", author: "Joseph Campbell", school: "Mythology", era: "20th Century", themes: ["change", "freedom"] },
  { text: "The privilege of a lifetime is being who you are.", author: "Joseph Campbell", school: "Mythology", era: "20th Century", themes: ["self", "meaning"] },
  { text: "People say that what we're all seeking is a meaning for life. I think that what we're seeking is an experience of being alive.", author: "Joseph Campbell", school: "Mythology", era: "20th Century", themes: ["meaning", "joy"] },
  { text: "The goal of life is to make your heartbeat match the beat of the universe.", author: "Joseph Campbell", school: "Mythology", era: "20th Century", themes: ["meaning", "truth"] },

  // CLASSICAL GREEK
  { text: "No man ever steps in the same river twice, for it is not the same river and he is not the same man.", author: "Heraclitus", school: "Pre-Socratic", era: "5th Century BCE", themes: ["change", "truth"] },
  { text: "The soul is dyed the color of its thoughts.", author: "Heraclitus", school: "Pre-Socratic", era: "5th Century BCE", themes: ["self", "wisdom"] },
  { text: "Character is destiny.", author: "Heraclitus", school: "Pre-Socratic", era: "5th Century BCE", themes: ["self", "meaning"] },
  { text: "Out of every hundred men, ten shouldn't even be there, eighty are just targets, nine are the real fighters. Ah, but the one—one is a warrior.", author: "Heraclitus", school: "Pre-Socratic", era: "5th Century BCE", themes: ["courage", "truth"] },
  { text: "Be kind, for everyone you meet is fighting a hard battle.", author: "Plato", school: "Classical Greek", era: "4th Century BCE", themes: ["love", "wisdom"] },
  { text: "The first and greatest victory is to conquer yourself.", author: "Plato", school: "Classical Greek", era: "4th Century BCE", themes: ["self", "courage"] },
  { text: "Wise men speak because they have something to say; fools because they have to say something.", author: "Plato", school: "Classical Greek", era: "4th Century BCE", themes: ["wisdom", "truth"] },
  { text: "We can easily forgive a child who is afraid of the dark; the real tragedy of life is when men are afraid of the light.", author: "Plato", school: "Classical Greek", era: "4th Century BCE", themes: ["courage", "truth"] },
  { text: "Knowing yourself is the beginning of all wisdom.", author: "Aristotle", school: "Classical Greek", era: "4th Century BCE", themes: ["self", "wisdom"] },
  { text: "Happiness depends upon ourselves.", author: "Aristotle", school: "Classical Greek", era: "4th Century BCE", themes: ["joy", "self"] },
  { text: "Excellence is never an accident. It is always the result of high intention, sincere effort, and intelligent execution.", author: "Aristotle", school: "Classical Greek", era: "4th Century BCE", themes: ["meaning", "wisdom"] },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle", school: "Classical Greek", era: "4th Century BCE", themes: ["self", "wisdom"] },
  { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle", school: "Classical Greek", era: "4th Century BCE", themes: ["courage", "suffering"] },

  // POETS & LITERARY PHILOSOPHERS
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein", school: "Contemporary", era: "20th Century", themes: ["courage", "wisdom"] },
  { text: "Imagination is more important than knowledge. Knowledge is limited. Imagination encircles the world.", author: "Albert Einstein", school: "Contemporary", era: "20th Century", themes: ["wisdom", "truth"] },
  { text: "The measure of intelligence is the ability to change.", author: "Albert Einstein", school: "Contemporary", era: "20th Century", themes: ["change", "wisdom"] },
  { text: "A ship is safe in harbor, but that's not what ships are for.", author: "John A. Shedd", school: "Contemporary", era: "20th Century", themes: ["courage", "meaning"] },
  { text: "Ring the bells that still can ring. Forget your perfect offering. There is a crack in everything. That's how the light gets in.", author: "Leonard Cohen", school: "Literary Philosophy", era: "20th Century", themes: ["truth", "joy"] },
  { text: "And still, after all this time, the sun never says to the earth, 'You owe me.' Look what happens with a love like that. It lights the whole sky.", author: "Hafiz", school: "Sufism", era: "14th Century", themes: ["love", "joy"] },
  { text: "Even after all this time, the sun never says to the earth, 'You owe me.'", author: "Hafiz", school: "Sufism", era: "14th Century", themes: ["love", "freedom"] },
  { text: "Fear is the cheapest room in the house. I would like to see you living in better conditions.", author: "Hafiz", school: "Sufism", era: "14th Century", themes: ["courage", "joy"] },
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
      { name: 'inhale', label: 'breathe in', duration: 5 },
      { name: 'exhale', label: 'breathe out', duration: 6 },
    ],
    color: { inhale: '#1a3a4a', exhale: '#2a3a4a' },
  },
  relaxation: {
    name: '4-7-8 Sleep',
    description: 'Deep relaxation for sleep',
    phases: [
      { name: 'inhale', label: 'inhale', duration: 4 },
      { name: 'holdFull', label: 'hold', duration: 7 },
      { name: 'exhale', label: 'exhale', duration: 8 },
    ],
    color: { inhale: '#1a3a5a', holdFull: '#3a4a4a', exhale: '#2a2a4a' },
  },
  coherent: {
    name: 'Heart Coherence',
    description: '5 breaths per minute',
    phases: [
      { name: 'inhale', label: 'inhale', duration: 6 },
      { name: 'exhale', label: 'exhale', duration: 6 },
    ],
    color: { inhale: '#1a4a4a', exhale: '#2a3a5a' },
  },
  box: {
    name: 'Box Breathing',
    description: 'Navy SEAL calm focus',
    phases: [
      { name: 'inhale', label: 'inhale', duration: 4 },
      { name: 'holdFull', label: 'hold', duration: 4 },
      { name: 'exhale', label: 'exhale', duration: 4 },
      { name: 'holdEmpty', label: 'hold', duration: 4 },
    ],
    color: { inhale: '#1a3a4a', holdFull: '#2a4a3a', exhale: '#2a3a4a', holdEmpty: '#1a2a3a' },
  },
  extended: {
    name: 'Extended Exhale',
    description: 'Long exhale activates rest',
    phases: [
      { name: 'inhale', label: 'inhale', duration: 4 },
      { name: 'exhale', label: 'exhale slowly', duration: 8 },
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

  // PARASYMPATHETIC ACTIVATION TECHNIQUES

  physiologicalSigh: {
    name: 'Physiological Sigh',
    description: 'Fastest way to calm (Huberman)',
    phases: [
      { name: 'inhale', label: 'Inhale', duration: 2 },
      { name: 'inhale', label: 'Sip more air', duration: 1 },
      { name: 'exhale', label: 'Long exhale', duration: 6 },
      { name: 'holdEmpty', label: 'Rest', duration: 1 },
    ],
    color: { inhale: '#1a3a5a', exhale: '#1a2a4a', holdEmpty: '#1a2a3a' },
  },

  twoToOne: {
    name: '2:1 Breathing',
    description: 'Exhale double the inhale',
    phases: [
      { name: 'inhale', label: 'Inhale', duration: 4 },
      { name: 'exhale', label: 'Slow exhale', duration: 8 },
    ],
    color: { inhale: '#1a3a4a', exhale: '#1a2a3a' },
  },

  fourSixBreath: {
    name: '4-6 Anxiety Relief',
    description: 'Quick parasympathetic shift',
    phases: [
      { name: 'inhale', label: 'Inhale', duration: 4 },
      { name: 'exhale', label: 'Exhale', duration: 6 },
    ],
    color: { inhale: '#2a3a4a', exhale: '#1a2a4a' },
  },

  deepBelly: {
    name: 'Diaphragmatic',
    description: 'Deep belly breathing',
    phases: [
      { name: 'inhale', label: 'Fill belly', duration: 5 },
      { name: 'holdFull', label: 'Pause', duration: 2 },
      { name: 'exhale', label: 'Release', duration: 6 },
    ],
    color: { inhale: '#1a4a3a', holdFull: '#2a4a4a', exhale: '#1a3a3a' },
  },

  pursedLip: {
    name: 'Pursed Lip',
    description: 'Calms acute anxiety',
    phases: [
      { name: 'inhale', label: 'Nose inhale', duration: 3 },
      { name: 'exhale', label: 'Pursed lips out', duration: 6 },
    ],
    color: { inhale: '#2a3a4a', exhale: '#1a2a4a' },
  },

  vagalTone: {
    name: 'Vagal Toning',
    description: 'Activates vagus nerve',
    phases: [
      { name: 'inhale', label: 'Deep inhale', duration: 4 },
      { name: 'holdFull', label: 'Brief hold', duration: 2 },
      { name: 'exhale', label: 'Humming exhale', duration: 10 },
      { name: 'holdEmpty', label: 'Natural pause', duration: 2 },
    ],
    color: { inhale: '#1a3a5a', holdFull: '#2a4a5a', exhale: '#1a2a5a', holdEmpty: '#1a2a3a' },
  },

  alternate: {
    name: 'Alternate Nostril',
    description: 'Nadi Shodhana - balances',
    phases: [
      { name: 'inhale', label: 'Left nostril in', duration: 4 },
      { name: 'holdFull', label: 'Hold', duration: 4 },
      { name: 'exhale', label: 'Right nostril out', duration: 4 },
      { name: 'inhale', label: 'Right nostril in', duration: 4 },
      { name: 'holdFull', label: 'Hold', duration: 4 },
      { name: 'exhale', label: 'Left nostril out', duration: 4 },
    ],
    color: { inhale: '#1a3a5a', holdFull: '#2a4a4a', exhale: '#1a2a4a' },
  },

  threeSixFive: {
    name: '365 Method',
    description: '3x daily, 6 breaths/min, 5 min',
    phases: [
      { name: 'inhale', label: 'Inhale', duration: 5 },
      { name: 'exhale', label: 'Exhale', duration: 5 },
    ],
    color: { inhale: '#2a4a4a', exhale: '#1a3a4a' },
  },

  softBelly: {
    name: 'Soft Belly',
    description: 'Mindful belly softening',
    phases: [
      { name: 'inhale', label: 'Soft...', duration: 4 },
      { name: 'exhale', label: 'Belly...', duration: 6 },
    ],
    color: { inhale: '#2a3a3a', exhale: '#1a2a3a' },
  },

  cooling: {
    name: 'Sitali Cooling',
    description: 'Cools body and mind',
    phases: [
      { name: 'inhale', label: 'Inhale through tongue', duration: 4 },
      { name: 'holdFull', label: 'Hold', duration: 2 },
      { name: 'exhale', label: 'Nose exhale', duration: 6 },
    ],
    color: { inhale: '#1a4a5a', holdFull: '#2a5a5a', exhale: '#1a3a4a' },
  },

  moonBreath: {
    name: 'Chandra Bhedana',
    description: 'Left nostril only - calming',
    phases: [
      { name: 'inhale', label: 'Left nostril in', duration: 4 },
      { name: 'holdFull', label: 'Hold gently', duration: 2 },
      { name: 'exhale', label: 'Right nostril out', duration: 6 },
    ],
    color: { inhale: '#1a2a4a', holdFull: '#2a3a5a', exhale: '#1a2a3a' },
  },

  relaxingBreath: {
    name: 'Relaxing 5-2-7',
    description: 'Gentle sleep preparation',
    phases: [
      { name: 'inhale', label: 'Gentle inhale', duration: 5 },
      { name: 'holdFull', label: 'Soft hold', duration: 2 },
      { name: 'exhale', label: 'Releasing', duration: 7 },
    ],
    color: { inhale: '#1a2a4a', holdFull: '#2a3a4a', exhale: '#1a1a3a' },
  },

  triangle: {
    name: 'Triangle Breath',
    description: 'Equal inhale-hold-exhale',
    phases: [
      { name: 'inhale', label: 'Inhale', duration: 4 },
      { name: 'holdFull', label: 'Hold', duration: 4 },
      { name: 'exhale', label: 'Exhale', duration: 4 },
    ],
    color: { inhale: '#1a3a4a', holdFull: '#2a4a4a', exhale: '#1a2a4a' },
  },

  antiAnxiety: {
    name: 'Anti-Anxiety',
    description: 'Long exhale with pause',
    phases: [
      { name: 'inhale', label: 'Gentle inhale', duration: 3 },
      { name: 'exhale', label: 'Extended exhale', duration: 9 },
      { name: 'holdEmpty', label: 'Natural rest', duration: 3 },
    ],
    color: { inhale: '#1a3a4a', exhale: '#1a2a3a', holdEmpty: '#0a1a2a' },
  },
};

// ============================================================================
// GAZE MODE - Nervous System Regulation Tool
// Based on scientific research: fractals, bilateral stimulation, breath sync
// ============================================================================

// Organized by energy level for nervous system regulation
// Color palette constants
const PALETTE = {
  purple: '#7B68EE',
  steelBlue: '#4A90A4',
  sage: '#6B8E6B',
  orange: '#E07B53',
  sand: '#D4A574',
  gray: '#8B8B8B',
  teal: '#7FDBCA',
  // HSL hues for animations
  hues: {
    purple: 255,
    steelBlue: 191,
    sage: 120,
    orange: 17,
    sand: 31,
    teal: 162,
  }
};

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
  { key: 'ripples', name: 'Ripples' },
  { key: 'rain', name: 'Rain on Glass' },
  { key: 'jellyfish', name: 'Jellyfish 3D' },
  { key: 'jellyfish2d', name: 'Deep Sea' },
  { key: 'ink', name: 'Ink in Water' },
  { key: 'lava', name: 'Lava Lamp' },
  { key: 'aurora', name: 'Aurora' },
  { key: 'lotus', name: 'Lotus' },
  { key: 'smoke', name: 'Smoke' },
  { key: 'mandala', name: 'Mandala' },
  { key: 'stars', name: 'Starfield' },
  // New visuals
  { key: 'caustics', name: 'Caustics' },
  { key: 'mandelbrot', name: 'Mandelbrot' },
  { key: 'nebula', name: 'Nebula' },
  { key: 'moss', name: 'Moss' },
  { key: 'moon', name: 'Moon' },
  { key: 'kaleidoscope', name: 'Kaleidoscope' },
  { key: 'mushrooms', name: 'Mushrooms' },
  { key: 'lanterns', name: 'Lanterns' },
  // Mathematical/Topological visuals
  { key: 'kleinBottle', name: 'Klein Bottle' },
  { key: 'mobiusStrip', name: 'Möbius Strip' },
  { key: 'trefoilKnot', name: 'Trefoil Knot' },
  { key: 'gyroid', name: 'Gyroid' },
  { key: 'radiolarian', name: 'Radiolarian' },
  { key: 'neuralNetwork', name: 'Neural Network' },
  { key: 'lorenz', name: 'Lorenz Attractor' },
  { key: 'rossler', name: 'Rössler Attractor' },
  { key: 'ferrofluid', name: 'Ferrofluid' },
  { key: 'murmuration', name: 'Murmuration' },
  { key: 'morphingSolids', name: 'Morphing Solids' },
  { key: 'nestedSolids', name: 'Nested Solids' },
  { key: 'flowerOfLife', name: 'Flower of Life' },
  { key: 'sriYantra', name: 'Sri Yantra' },
  { key: 'breathingSphere', name: 'Breathing Sphere' },
  { key: 'invertingSphere', name: 'Inverting Sphere' },
];

const gazeShapes = [
  { key: 'torus', name: 'Torus', create: () => new THREE.TorusGeometry(1, 0.4, 16, 100) },
  { key: 'torusKnot', name: 'Knot', create: () => new THREE.TorusKnotGeometry(0.7, 0.25, 100, 16) },
];

// Breath cycle: 5s inhale, 6s exhale = ~5.5 breaths/min (parasympathetic optimal)
const BREATH_CYCLE = 11; // seconds for full cycle
const BREATH_SPEED = (2 * Math.PI) / BREATH_CYCLE;

function GazeMode({ theme, primaryHue = 162, onHueChange, backgroundMode = false, currentVisual, onVisualChange }) {
  // Use primaryHue throughout for consistent color scheme
  const hue = primaryHue;
  // Background mode: dimmer, slower, no interaction
  const bgOpacity = backgroundMode ? 0.3 : 1;
  const bgSpeed = backgroundMode ? 0.3 : 1;
  const containerRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const frameRef = React.useRef(null);
  const sceneRef = React.useRef(null);
  const rendererRef = React.useRef(null);
  const meshRef = React.useRef(null);
  const clockRef = React.useRef(null);

  // Use prop if provided, otherwise use internal state
  const [internalMode, setInternalMode] = React.useState('jellyfish');
  const currentMode = currentVisual !== undefined ? currentVisual : internalMode;
  const setCurrentMode = onVisualChange !== undefined ? onVisualChange : setInternalMode;
  const [currentShape, setCurrentShape] = React.useState('torus');
  const [showUI, setShowUI] = React.useState(false);
  const [selectedTechnique, setSelectedTechnique] = React.useState('relaxation');
  const [showVisualToast, setShowVisualToast] = React.useState(false);
  const toastTimeoutRef = React.useRef(null);

  // Breath session state for technique-based breathing
  const breathSessionRef = React.useRef({
    startTime: Date.now(),
    phaseIndex: 0,
    phaseStartTime: Date.now(),
  });

  // State for breath indicator display
  const [breathDisplay, setBreathDisplay] = React.useState({ phase: 0.5, phaseLabel: 'breathe in', isHolding: false });

  // ========== TOUCH INTERACTION SYSTEM ==========
  const touchPointsRef = React.useRef([]);
  const ripplesRef = React.useRef([]);
  const swipeStartRef = React.useRef(null);
  const wheelAccumRef = React.useRef(0);
  const wheelTimeoutRef = React.useRef(null);

  // Cycle to next/previous visual
  const cycleVisual = React.useCallback((direction) => {
    if (backgroundMode) return; // No cycling in background mode
    const currentIndex = gazeModes.findIndex(m => m.key === currentMode);
    let newIndex;
    if (direction > 0) {
      newIndex = (currentIndex + 1) % gazeModes.length;
    } else {
      newIndex = (currentIndex - 1 + gazeModes.length) % gazeModes.length;
    }
    setCurrentMode(gazeModes[newIndex].key);
    setShowVisualToast(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setShowVisualToast(false), 1500);
  }, [currentMode, backgroundMode]);

  // Track touch/mouse positions with spring physics
  const handleInteractionStart = React.useCallback((e) => {
    if (backgroundMode || showUI) return; // No interaction in background mode
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
  }, [backgroundMode, showUI]);

  const handleInteractionMove = React.useCallback((e) => {
    if (backgroundMode || showUI) return;
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
  }, [backgroundMode, showUI]);

  const handleInteractionEnd = React.useCallback((e) => {
    if (backgroundMode) return; // No gesture handling in background mode
    const touches = e.changedTouches ? Array.from(e.changedTouches) : [{ identifier: 'mouse', clientX: e.clientX, clientY: e.clientY }];

    // Check for swipe gesture
    if (swipeStartRef.current && touches.length === 1) {
      const endX = touches[0].clientX;
      const endY = touches[0].clientY;
      const deltaX = endX - swipeStartRef.current.x;
      const deltaY = endY - swipeStartRef.current.y;
      const deltaTime = Date.now() - swipeStartRef.current.time;

      const minSwipeDistance = 60;
      const maxSwipeTime = 400;

      // Detect horizontal swipe: change visual
      if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaX) > Math.abs(deltaY) * 1.5 && deltaTime < maxSwipeTime) {
        cycleVisual(deltaX > 0 ? -1 : 1); // Swipe left = next, swipe right = previous
        swipeStartRef.current = null;
        return; // Don't process further
      }

      // Detect vertical swipe UP: open mode selector (swipe must start in bottom third of screen)
      const screenHeight = window.innerHeight;
      if (deltaY < -minSwipeDistance && Math.abs(deltaY) > Math.abs(deltaX) * 1.5 && deltaTime < maxSwipeTime) {
        if (swipeStartRef.current.y > screenHeight * 0.5) { // Started in bottom half
          setShowUI(true);
          swipeStartRef.current = null;
          return;
        }
      }

      // Detect vertical swipe DOWN: close mode selector
      if (deltaY > minSwipeDistance && Math.abs(deltaY) > Math.abs(deltaX) * 1.5 && deltaTime < maxSwipeTime && showUI) {
        setShowUI(false);
        swipeStartRef.current = null;
        return;
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
  }, [backgroundMode, cycleVisual, showUI]);

  // Two-finger swipe (wheel event on trackpad) to change visuals or open menu
  const showUIRef = React.useRef(showUI);
  showUIRef.current = showUI;
  const wheelAccumXRef = React.useRef(0);

  React.useEffect(() => {
    // Skip wheel handling in background mode
    if (backgroundMode) return;

    const handleWheel = (e) => {
      // When menu is open, let scroll pass through naturally
      if (showUIRef.current) return;

      // Track both horizontal and vertical scroll
      wheelAccumRef.current += e.deltaY;
      wheelAccumXRef.current += e.deltaX;

      clearTimeout(wheelTimeoutRef.current);
      wheelTimeoutRef.current = setTimeout(() => {
        wheelAccumRef.current = 0;
        wheelAccumXRef.current = 0;
      }, 200);

      const threshold = 50;

      // Horizontal swipe = change visual
      if (Math.abs(wheelAccumXRef.current) > threshold) {
        e.preventDefault();
        cycleVisual(wheelAccumXRef.current > 0 ? 1 : -1); // Swipe right = next, left = previous
        wheelAccumXRef.current = 0;
        wheelAccumRef.current = 0;
      }
      // Vertical swipe UP = open menu
      else if (wheelAccumRef.current > threshold) {
        e.preventDefault();
        setShowUI(true);
        wheelAccumRef.current = 0;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [backgroundMode, cycleVisual]);

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
      ctx.strokeStyle = `hsla(${hue}, 52%, 68%, ${opacity})`;
      ctx.lineWidth = 2 * (1 - progress);
      ctx.stroke();

      return true;
    });
  }, [hue]);

  // Get breath info based on selected technique
  const getBreathInfo = React.useCallback((elapsed) => {
    const technique = breathTechniques[selectedTechnique];
    if (!technique) {
      const phase = Math.sin(elapsed * BREATH_SPEED) * 0.5 + 0.5;
      return { phase, phaseName: phase > 0.5 ? 'inhale' : 'exhale', phaseLabel: phase > 0.5 ? 'breathe in' : 'breathe out', isInhaling: phase > 0.5 };
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
    return { phase: 0.5, phaseName: 'inhale', phaseLabel: 'breathe in', isInhaling: true };
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
    // Convert HSL hue to hex color for THREE.js
    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };
    const dynamicColor = hslToHex(hue, 52, 68);
    const material = new THREE.MeshBasicMaterial({ color: dynamicColor, wireframe: true, transparent: true, opacity: 0.8 });
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
  }, [currentMode, currentShape, hue]);

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

      // Color gradient: warm brown at base to theme color at tips
      const t = 1 - depth / 8;
      const lightness = 30 + t * 35;
      const saturation = 25 + t * 30;

      ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${0.4 + breath * 0.4})`;
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
  }, [currentMode, getInteractionInfluence, drawRipples, hue]);

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
      gradient.addColorStop(0, `hsla(${hue}, 52%, 68%, ${0.6 + breath * 0.3})`);
      gradient.addColorStop(0.5, `hsla(${hue}, 52%, 68%, ${0.2 + breath * 0.2})`);
      gradient.addColorStop(1, `hsla(${hue}, 52%, 68%, 0)`);

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
        ctx.fillStyle = `hsla(${hue}, 52%, 68%, ${0.15 / i})`;
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
  }, [currentMode, drawRipples, hue]);

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
        ctx.strokeStyle = `hsla(${hue}, 52%, 68%, ${opacity})`;
        ctx.lineWidth = 2 - progress;
        ctx.stroke();
      });

      // Central breathing orb - responds to touch
      const centerInfluence = getInteractionInfluence(centerX, centerY, 200);
      const coreRadius = 20 + breath * 30 + centerInfluence.strength * 20;
      const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius * 2);
      coreGradient.addColorStop(0, `hsla(${hue}, 52%, 68%, ${0.4 + breath * 0.3 + centerInfluence.strength * 0.3})`);
      coreGradient.addColorStop(0.5, `hsla(${hue}, 45%, 55%, ${0.2 + breath * 0.1})`);
      coreGradient.addColorStop(1, `hsla(${hue}, 40%, 45%, 0)`);

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
  }, [currentMode, getInteractionInfluence, drawRipples, hue]);

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
        gradient.addColorStop(0, `hsla(${hue}, 52%, 68%, ${0.15 + orbBreath * 0.1 + influence.strength * 0.2})`);
        gradient.addColorStop(0.3, `hsla(${hue}, 45%, 55%, ${0.08 + orbBreath * 0.05 + influence.strength * 0.1})`);
        gradient.addColorStop(0.6, `hsla(${hue}, 40%, 45%, ${0.03 + influence.strength * 0.05})`);
        gradient.addColorStop(1, `hsla(${hue}, 35%, 35%, 0)`);

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
      centerGradient.addColorStop(1, `hsla(${hue}, 52%, 68%, 0)`);

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
  }, [currentMode, getInteractionInfluence, drawRipples, hue]);

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
        const lightness = 30 + t * 35;
        const saturation = 35 + t * 25;

        const glowBoost = influence.strength * 0.3;
        ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${0.3 + breath * 0.4 + glowBoost})`;
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
  }, [currentMode, getInteractionInfluence, drawRipples, hue]);

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

        // Leaf gradient from center (lighter) to edge (darker)
        const t = i / leafCount;
        const lightness = 40 + (1-t) * 25 + influence.strength * 15;
        const saturation = 45 + (1-t) * 15 + influence.strength * 10;

        // Draw leaf shape with touch displacement
        ctx.save();
        ctx.translate(x + influence.x * 0.2, y + influence.y * 0.2);
        ctx.rotate(angle + Math.PI / 2);

        ctx.beginPath();
        ctx.ellipse(0, 0, leafSize * 0.6, leafSize, 0, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${0.6 + breath * 0.3 + influence.strength * 0.2})`;
        ctx.fill();
        ctx.strokeStyle = `hsla(${hue}, ${saturation + 10}%, ${lightness + 10}%, ${0.3 + influence.strength * 0.3})`;
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
  }, [currentMode, getInteractionInfluence, drawRipples, hue]);

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

      const length = 65 - depth * 7 + Math.random() * 30; // Larger branches
      const endX = x + Math.cos(angle) * length;
      const endY = y + Math.sin(angle) * length;

      branches.push({ x1: x, y1: y, x2: endX, y2: endY, depth, maxDepth });

      const branchCount = depth < 2 ? 3 : 2;
      for (let i = 0; i < branchCount; i++) {
        const newAngle = angle + (Math.random() - 0.5) * 1.2;
        generateCoral(endX, endY, newAngle, depth + 1, maxDepth);
      }
    };

    // Create multiple coral structures - larger and more
    const coralBases = [
      { x: canvas.width * 0.15, maxDepth: 7 },
      { x: canvas.width * 0.35, maxDepth: 8 },
      { x: canvas.width * 0.5, maxDepth: 9 },
      { x: canvas.width * 0.65, maxDepth: 8 },
      { x: canvas.width * 0.85, maxDepth: 7 },
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

        // Color: gradient based on depth, brighter near touch
        const t = branch.depth / branch.maxDepth;
        const lightness = 35 + t * 30 + influence.strength * 12;
        const saturation = 40 + t * 20 + influence.strength * 10;

        ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${0.4 + breath * 0.4 + influence.strength * 0.2})`;
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
          ctx.fillStyle = `hsla(${hue}, 52%, 68%, ${0.3 + breath * 0.5 + tipGlow})`;
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
  }, [currentMode, getInteractionInfluence, drawRipples, hue]);

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
  }, [currentMode, getInteractionInfluence, drawRipples, hue]);

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

        ctx.strokeStyle = `hsla(${hue}, 52%, 68%, ${0.1 + breath * 0.1 + influence.strength * 0.3})`;
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
        ctx.fillStyle = `hsla(${hue}, 52%, 68%, ${0.5 + breath * 0.3 + influence.strength * 0.3})`;
        ctx.fill();
      });

      // Draw nodes with touch glow
      nodes.forEach(node => {
        const influence = getInteractionInfluence(node.x, node.y, 120);
        const pulse = Math.sin(elapsed * 2 + node.phase) * 0.3;
        const radius = node.radius * (1 + pulse) * (0.8 + breath * 0.2) * (1 + influence.strength * 0.5);

        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 2);
        gradient.addColorStop(0, `hsla(${hue}, 52%, 68%, ${0.6 + breath * 0.3 + influence.strength * 0.4})`);
        gradient.addColorStop(1, `hsla(${hue}, 52%, 68%, 0)`);

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
  }, [currentMode, getInteractionInfluence, drawRipples, hue]);

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

      const length = 120 - depth * 12;  // Larger branches
      const endX = x + Math.cos(angle) * length;
      const endY = y + Math.sin(angle) * length;

      branches.push({ x1: x, y1: y, x2: endX, y2: endY, depth, maxDepth, side });

      const spread = 0.45 - depth * 0.03;  // Slightly wider spread
      generateLung(endX, endY, angle - spread, depth + 1, maxDepth, side);
      generateLung(endX, endY, angle + spread, depth + 1, maxDepth, side);
    };

    const centerX = canvas.width / 2;
    const startY = canvas.height * 0.08;  // Start higher on screen

    // Trachea (longer)
    branches.push({ x1: centerX, y1: startY - 60, x2: centerX, y2: startY, depth: 0, maxDepth: 7, side: 'center' });

    // Left and right lungs (more depth, wider angle)
    generateLung(centerX, startY, Math.PI / 2 - 0.55, 1, 7, 'left');
    generateLung(centerX, startY, Math.PI / 2 + 0.55, 1, 7, 'right');

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
          gradient.addColorStop(1, `hsla(${hue}, 52%, 68%, 0)`);

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
          gradient.addColorStop(1, `hsla(${hue}, 52%, 68%, 0)`);

          ctx.beginPath();
          ctx.arc(tipX, tipY, glowSize, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
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
  }, [currentMode, getInteractionInfluence, drawRipples, hue]);

  // ========== LUNG CAPILLARIES MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'lungCapillaries' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    const centerX = canvas.width / 2;
    const startY = canvas.height * 0.12;

    // Colors based on selected hue - darker for deoxygenated, brighter for oxygenated
    const colorDeoxygenated = { h: hue, s: 40, l: 35 }; // Dimmer version
    const colorOxygenated = { h: hue, s: 60, l: 70 };   // Brighter version
    const colorBlue = { h: hue, s: 50, l: 50 };         // Mid tone

    // Branch class for the bronchial tree
    class Branch {
      constructor(x1, y1, angle, length, depth, maxDepth, side, parent = null) {
        this.x1 = x1;
        this.y1 = y1;
        this.angle = angle;
        this.length = length;
        this.depth = depth;
        this.maxDepth = maxDepth;
        this.side = side;
        this.parent = parent;

        // Calculate endpoint with slight organic curve
        const curve = Math.sin(depth * 1.5) * 0.1;
        this.x2 = x1 + Math.cos(angle + curve) * length;
        this.y2 = y1 + Math.sin(angle + curve) * length;

        // Visual properties
        this.thickness = Math.max(1, 8 - depth * 0.9);
        this.fillProgress = 0;
        this.targetFillProgress = 0;

        // For animation timing - deeper branches fill later
        this.fillDelay = depth * 0.12;
        this.children = [];
        this.alveoli = null;
      }

      // Calculate distance from trachea for fill timing
      getPathDistance() {
        let dist = this.length;
        let current = this.parent;
        while (current) {
          dist += current.length;
          current = current.parent;
        }
        return dist;
      }
    }

    // Alveoli cluster class (grape-like endpoint clusters)
    class AlveoliCluster {
      constructor(x, y, depth, side) {
        this.x = x;
        this.y = y;
        this.depth = depth;
        this.side = side;
        this.fillProgress = 0;
        this.pulsePhase = Math.random() * Math.PI * 2;

        // Generate 4-7 small spheres in a cluster
        this.spheres = [];
        const count = 4 + Math.floor(Math.random() * 4);
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
          const dist = 3 + Math.random() * 5;
          this.spheres.push({
            offsetX: Math.cos(angle) * dist,
            offsetY: Math.sin(angle) * dist,
            radius: 2 + Math.random() * 3,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
    }

    // Generate the bronchial tree using L-system-like recursion
    const allBranches = [];
    const allAlveoli = [];

    const generateBranch = (x, y, angle, length, depth, maxDepth, side, parent = null) => {
      if (depth > maxDepth) {
        // Create alveoli cluster at endpoint
        const cluster = new AlveoliCluster(x, y, depth, side);
        allAlveoli.push(cluster);
        if (parent) parent.alveoli = cluster;
        return null;
      }

      const branch = new Branch(x, y, angle, length, depth, maxDepth, side, parent);
      allBranches.push(branch);

      // Calculate child branch parameters
      const nextLength = length * (0.72 + Math.random() * 0.08);
      const spread = 0.35 - depth * 0.025;
      const jitter = (Math.random() - 0.5) * 0.15;

      // Generate 2-3 child branches
      const childCount = depth < 3 ? 2 : (Math.random() > 0.3 ? 2 : 3);

      if (childCount === 2) {
        const child1 = generateBranch(branch.x2, branch.y2, angle - spread + jitter, nextLength, depth + 1, maxDepth, side, branch);
        const child2 = generateBranch(branch.x2, branch.y2, angle + spread + jitter, nextLength, depth + 1, maxDepth, side, branch);
        if (child1) branch.children.push(child1);
        if (child2) branch.children.push(child2);
      } else {
        const child1 = generateBranch(branch.x2, branch.y2, angle - spread + jitter, nextLength, depth + 1, maxDepth, side, branch);
        const child2 = generateBranch(branch.x2, branch.y2, angle + jitter * 0.5, nextLength * 0.9, depth + 1, maxDepth, side, branch);
        const child3 = generateBranch(branch.x2, branch.y2, angle + spread + jitter, nextLength, depth + 1, maxDepth, side, branch);
        if (child1) branch.children.push(child1);
        if (child2) branch.children.push(child2);
        if (child3) branch.children.push(child3);
      }

      return branch;
    };

    // Create trachea
    const tracheaLength = canvas.height * 0.08;
    const trachea = new Branch(centerX, startY - tracheaLength, Math.PI / 2, tracheaLength, 0, 7, 'center');
    allBranches.push(trachea);

    // Right lung (3 lobes - slightly larger)
    const rightMaxDepth = 7;
    const rightStartAngle = Math.PI / 2 + 0.45;
    generateBranch(centerX, startY, rightStartAngle, 55, 1, rightMaxDepth, 'right', trachea);
    // Upper lobe branch
    generateBranch(centerX + 15, startY + 20, rightStartAngle - 0.6, 40, 2, rightMaxDepth - 1, 'right', trachea);
    // Middle lobe branch
    generateBranch(centerX + 25, startY + 60, rightStartAngle - 0.3, 35, 3, rightMaxDepth - 1, 'right', trachea);

    // Left lung (2 lobes - slightly smaller, with cardiac notch)
    const leftMaxDepth = 6;
    const leftStartAngle = Math.PI / 2 - 0.45;
    generateBranch(centerX, startY, leftStartAngle, 50, 1, leftMaxDepth, 'left', trachea);
    // Upper lobe branch
    generateBranch(centerX - 15, startY + 25, leftStartAngle + 0.5, 38, 2, leftMaxDepth - 1, 'left', trachea);

    // Particle system for oxygen molecules
    const particles = [];
    const MAX_PARTICLES = 150;

    class OxygenParticle {
      constructor(startX, startY, branch) {
        this.x = startX;
        this.y = startY;
        this.branch = branch;
        this.progress = 0; // 0-1 along branch
        this.speed = 0.02 + Math.random() * 0.015;
        this.size = 1.5 + Math.random() * 1.5;
        this.alpha = 0.6 + Math.random() * 0.4;
        this.alive = true;
        this.direction = 1; // 1 = inward (inhale), -1 = outward (exhale)
      }

      update(isInhaling) {
        this.direction = isInhaling ? 1 : -1;
        this.progress += this.speed * this.direction;

        if (this.progress >= 1 && this.direction === 1) {
          // Reached end of branch - pick a child branch or die at alveoli
          if (this.branch.children.length > 0) {
            this.branch = this.branch.children[Math.floor(Math.random() * this.branch.children.length)];
            this.progress = 0;
          } else {
            this.alive = false;
          }
        } else if (this.progress <= 0 && this.direction === -1) {
          // Going backwards - move to parent
          if (this.branch.parent) {
            this.branch = this.branch.parent;
            this.progress = 1;
          } else {
            this.alive = false;
          }
        }

        // Calculate position along branch
        const t = Math.max(0, Math.min(1, this.progress));
        this.x = this.branch.x1 + (this.branch.x2 - this.branch.x1) * t;
        this.y = this.branch.y1 + (this.branch.y2 - this.branch.y1) * t;
      }
    }

    // Spawn particles from trachea during inhale
    const spawnParticle = () => {
      if (particles.length < MAX_PARTICLES) {
        const p = new OxygenParticle(trachea.x1, trachea.y1, trachea);
        particles.push(p);
      }
    };

    // Calculate max path distance for normalization
    let maxPathDist = 0;
    allBranches.forEach(b => {
      const dist = b.getPathDistance();
      if (dist > maxPathDist) maxPathDist = dist;
    });

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;

      // Get detailed breath info
      const breathInfo = getBreathInfo(elapsed);
      const phase = breathInfo.phase; // 0-1
      const phaseName = breathInfo.phaseName; // inhale, holdFull, exhale, holdEmpty
      const phaseProgress = breathInfo.phaseProgress || phase;
      const isInhaling = phaseName === 'inhale';
      const isHoldingFull = phaseName === 'holdFull';
      const isExhaling = phaseName === 'exhale';
      const isHoldingEmpty = phaseName === 'holdEmpty';

      // Dark background with subtle vignette
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Vignette effect
      const vignette = ctx.createRadialGradient(
        centerX, canvas.height * 0.45, 0,
        centerX, canvas.height * 0.45, canvas.width * 0.7
      );
      vignette.addColorStop(0, 'transparent');
      vignette.addColorStop(0.7, 'transparent');
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate fill progress for each branch based on breath phase and depth
      allBranches.forEach(branch => {
        const depthNorm = branch.depth / branch.maxDepth;
        const pathDist = branch.getPathDistance() / maxPathDist;

        if (isInhaling) {
          // Fill from trachea outward - deeper branches fill later
          const fillTiming = depthNorm * 0.7; // stagger by depth
          branch.targetFillProgress = Math.max(0, Math.min(1, (phaseProgress - fillTiming) / (1 - fillTiming)));
        } else if (isHoldingFull) {
          // Full glow with subtle pulse
          branch.targetFillProgress = 1;
        } else if (isExhaling) {
          // Drain from endpoints inward - tips empty first
          const drainTiming = (1 - depthNorm) * 0.7;
          branch.targetFillProgress = 1 - Math.max(0, Math.min(1, (phaseProgress - drainTiming) / (1 - drainTiming)));
        } else if (isHoldingEmpty) {
          // Minimal glow
          branch.targetFillProgress = 0;
        }

        // Smooth transition
        branch.fillProgress += (branch.targetFillProgress - branch.fillProgress) * 0.15;
      });

      // Update alveoli fill progress
      allAlveoli.forEach(alveolus => {
        const depthNorm = alveolus.depth / 7;

        if (isInhaling) {
          const fillTiming = 0.6; // Alveoli fill near end of inhale
          alveolus.fillProgress = Math.max(0, Math.min(1, (phaseProgress - fillTiming) / (1 - fillTiming)));
        } else if (isHoldingFull) {
          alveolus.fillProgress = 1;
        } else if (isExhaling) {
          alveolus.fillProgress = 1 - phaseProgress;
        } else {
          alveolus.fillProgress = 0;
        }
      });

      // Spawn particles during inhale
      if (isInhaling && Math.random() < 0.3) {
        spawnParticle();
      }

      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update(isInhaling);
        if (!particles[i].alive) {
          particles.splice(i, 1);
        }
      }

      // Draw branches with gradient fill effect
      allBranches.forEach(branch => {
        const fill = branch.fillProgress;

        // Interpolate color based on fill
        const h = colorDeoxygenated.h + (colorOxygenated.h - colorDeoxygenated.h) * fill;
        const s = colorDeoxygenated.s + (colorOxygenated.s - colorDeoxygenated.s) * fill;
        const l = colorDeoxygenated.l + (colorOxygenated.l - colorDeoxygenated.l) * fill + fill * 10;

        // Touch interaction
        const influence = getInteractionInfluence(branch.x2, branch.y2, 100);

        // Draw branch glow (outer)
        if (fill > 0.1) {
          ctx.strokeStyle = `hsla(${h}, ${s}%, ${l}%, ${0.15 * fill})`;
          ctx.lineWidth = branch.thickness + 6;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(branch.x1 + influence.x * 0.05, branch.y1 + influence.y * 0.05);
          ctx.lineTo(branch.x2 + influence.x * 0.1, branch.y2 + influence.y * 0.1);
          ctx.stroke();
        }

        // Draw main branch
        const baseAlpha = 0.3 + fill * 0.5 + influence.strength * 0.2;
        ctx.strokeStyle = `hsla(${h}, ${s}%, ${l}%, ${baseAlpha})`;
        ctx.lineWidth = branch.thickness + influence.strength * 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(branch.x1 + influence.x * 0.05, branch.y1 + influence.y * 0.05);
        ctx.lineTo(branch.x2 + influence.x * 0.1, branch.y2 + influence.y * 0.1);
        ctx.stroke();

        // Draw fill gradient along branch length
        if (fill > 0.05) {
          const gradStart = { x: branch.x1, y: branch.y1 };
          const gradEnd = { x: branch.x2, y: branch.y2 };

          // Animated fill position along branch
          const fillPos = isInhaling ? fill : (1 - fill);
          const fillX = branch.x1 + (branch.x2 - branch.x1) * fillPos;
          const fillY = branch.y1 + (branch.y2 - branch.y1) * fillPos;

          const fillGradient = ctx.createRadialGradient(fillX, fillY, 0, fillX, fillY, 12);
          fillGradient.addColorStop(0, `hsla(${colorOxygenated.h}, 80%, 65%, ${0.5 * fill})`);
          fillGradient.addColorStop(1, 'transparent');

          ctx.beginPath();
          ctx.arc(fillX, fillY, 12, 0, Math.PI * 2);
          ctx.fillStyle = fillGradient;
          ctx.fill();
        }
      });

      // Draw alveoli clusters
      allAlveoli.forEach(cluster => {
        const fill = cluster.fillProgress;
        const pulse = isHoldingFull ? Math.sin(elapsed * 3 + cluster.pulsePhase) * 0.15 : 0;
        const influence = getInteractionInfluence(cluster.x, cluster.y, 80);

        cluster.spheres.forEach(sphere => {
          const x = cluster.x + sphere.offsetX + influence.x * 0.15;
          const y = cluster.y + sphere.offsetY + influence.y * 0.15;
          const r = sphere.radius * (1 + fill * 0.12 + pulse * 0.5) + influence.strength * 1;

          // Interpolate color
          const h = colorDeoxygenated.h + (colorOxygenated.h - colorDeoxygenated.h) * fill;
          const glowSize = r * (1.5 + fill * 0.4);

          // Outer glow - more subtle
          const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
          glowGradient.addColorStop(0, `hsla(${h}, 70%, 60%, ${0.25 * fill + influence.strength * 0.2})`);
          glowGradient.addColorStop(0.5, `hsla(${h}, 60%, 50%, ${0.1 * fill})`);
          glowGradient.addColorStop(1, 'transparent');

          ctx.beginPath();
          ctx.arc(x, y, glowSize, 0, Math.PI * 2);
          ctx.fillStyle = glowGradient;
          ctx.fill();

          // Core sphere
          const coreGradient = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
          coreGradient.addColorStop(0, `hsla(${h}, 75%, 70%, ${0.6 + fill * 0.3})`);
          coreGradient.addColorStop(0.7, `hsla(${h}, 70%, 55%, ${0.4 + fill * 0.3})`);
          coreGradient.addColorStop(1, `hsla(${h}, 65%, 45%, ${0.2 + fill * 0.2})`);

          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fillStyle = coreGradient;
          ctx.fill();
        });
      });

      // Draw particles (oxygen molecules)
      particles.forEach(p => {
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
        gradient.addColorStop(0, `hsla(${colorOxygenated.h}, 90%, 70%, ${p.alpha})`);
        gradient.addColorStop(0.5, `hsla(${colorOxygenated.h}, 80%, 60%, ${p.alpha * 0.5})`);
        gradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      // Draw subtle lung silhouette outline
      ctx.strokeStyle = `hsla(${hue}, 30%, 40%, 0.15)`;
      ctx.lineWidth = 1;

      // Right lung outline
      ctx.beginPath();
      ctx.moveTo(centerX + 20, startY);
      ctx.quadraticCurveTo(centerX + 180, startY + 100, centerX + 170, startY + 280);
      ctx.quadraticCurveTo(centerX + 140, startY + 380, centerX + 20, startY + 350);
      ctx.stroke();

      // Left lung outline (with cardiac notch)
      ctx.beginPath();
      ctx.moveTo(centerX - 20, startY);
      ctx.quadraticCurveTo(centerX - 160, startY + 100, centerX - 150, startY + 200);
      ctx.quadraticCurveTo(centerX - 100, startY + 280, centerX - 80, startY + 300); // Cardiac notch
      ctx.quadraticCurveTo(centerX - 130, startY + 350, centerX - 20, startY + 350);
      ctx.stroke();

      // Draw touch ripples
      drawRipples(ctx);

      // Phase indicator at bottom
      const phaseText = {
        'inhale': 'inhale',
        'holdFull': 'hold',
        'exhale': 'exhale',
        'holdEmpty': 'rest'
      }[phaseName] || 'breathe';

      ctx.fillStyle = `hsla(${hue}, 50%, 70%, 0.6)`;
      ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(phaseText, centerX, canvas.height - 40);

      // Progress arc
      const arcRadius = 20;
      const arcX = centerX;
      const arcY = canvas.height - 70;

      ctx.strokeStyle = `hsla(${hue}, 30%, 40%, 0.3)`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(arcX, arcY, arcRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = `hsla(${hue}, 60%, 60%, 0.8)`;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(arcX, arcY, arcRadius, -Math.PI / 2, -Math.PI / 2 + phaseProgress * Math.PI * 2);
      ctx.stroke();
    };

    ctx.fillStyle = '#0a0a0f';
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
  }, [currentMode, getBreathInfo, getInteractionInfluence, drawRipples, hue]);

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
        glowGradient.addColorStop(0, `hsla(${hue}, 52%, 68%, ${0.15 * this.opacity * breath})`);
        glowGradient.addColorStop(1, `hsla(${hue}, 52%, 68%, 0)`);
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
        dropGradient.addColorStop(0.3, `hsla(${hue}, 52%, 68%, ${0.35 * this.opacity})`);
        dropGradient.addColorStop(0.7, `hsla(${hue}, 45%, 55%, ${0.2 * this.opacity})`);
        dropGradient.addColorStop(1, `hsla(${hue}, 40%, 45%, ${0.1 * this.opacity})`);

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
        trailCtx.strokeStyle = `hsla(${hue}, 52%, 68%, 0.12)`;
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

  // ========== JELLYFISH MODE (THREE.JS 3D) ==========
  React.useEffect(() => {
    if (currentMode !== 'jellyfish' || !containerRef.current) return;

    // === COLOR SCHEME ===
    const COLORS = {
      bell: new THREE.Color('#4ECDC4'),
      tentacle: new THREE.Color('#2A9D8F'),
      accent: new THREE.Color('#7FFFE5'),
      dim: new THREE.Color('#1A3A38'),
      background: new THREE.Color('#000000')
    };

    // === STATE ===
    let breathPhase = 'exhale';
    let breathProgress = 1.0;
    let isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let lastInteractionTime = Date.now();
    let isAutoRotating = false;
    let mousePos = new THREE.Vector2();
    let mouse3D = new THREE.Vector3();
    const raycaster = new THREE.Raycaster();
    const clock = new THREE.Clock();
    let bellFlashIntensity = 0;

    // === SCENE SETUP ===
    const scene = new THREE.Scene();
    scene.background = COLORS.background;

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // === ORBIT CONTROLS ===
    let controls = null;
    if (THREE.OrbitControls) {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.minDistance = 1;
      controls.maxDistance = 15;
      controls.enablePan = true;
      controls.autoRotate = false;
      controls.autoRotateSpeed = 0.3;
    }

    // === JELLYFISH GROUP ===
    const jellyfishGroup = new THREE.Group();
    scene.add(jellyfishGroup);

    // === BELL GEOMETRY (Parametric hemisphere with ruffled edge) ===
    const bellGeometry = new THREE.BufferGeometry();
    const bellSegments = 64;
    const bellRings = 32;
    const bellVertices = [];
    const bellIndices = [];
    const bellUvs = [];

    for (let ring = 0; ring <= bellRings; ring++) {
      const phi = (ring / bellRings) * Math.PI * 0.5; // Hemisphere
      for (let seg = 0; seg <= bellSegments; seg++) {
        const theta = (seg / bellSegments) * Math.PI * 2;

        // Ruffled edge at rim
        let radius = 1.0;
        if (ring > bellRings * 0.7) {
          const edgeFactor = (ring - bellRings * 0.7) / (bellRings * 0.3);
          radius *= 1 + Math.sin(theta * 8) * 0.1 * edgeFactor + Math.sin(theta * 13) * 0.05 * edgeFactor;
        }

        const x = Math.sin(phi) * Math.cos(theta) * radius;
        const y = Math.cos(phi); // Dome on top, opening at bottom
        const z = Math.sin(phi) * Math.sin(theta) * radius;

        bellVertices.push(x, y, z);
        bellUvs.push(seg / bellSegments, ring / bellRings);
      }
    }

    for (let ring = 0; ring < bellRings; ring++) {
      for (let seg = 0; seg < bellSegments; seg++) {
        const a = ring * (bellSegments + 1) + seg;
        const b = a + bellSegments + 1;
        bellIndices.push(a, b, a + 1);
        bellIndices.push(b, b + 1, a + 1);
      }
    }

    bellGeometry.setAttribute('position', new THREE.Float32BufferAttribute(bellVertices, 3));
    bellGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(bellUvs, 2));
    bellGeometry.setIndex(bellIndices);
    bellGeometry.computeVertexNormals();

    const bellMaterial = new THREE.MeshBasicMaterial({
      color: COLORS.bell,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
    const bell = new THREE.Mesh(bellGeometry, bellMaterial);
    jellyfishGroup.add(bell);

    // Inner bell for depth
    const innerBellGeometry = bellGeometry.clone();
    innerBellGeometry.scale(0.85, 0.85, 0.85);
    const innerBellMaterial = new THREE.MeshBasicMaterial({
      color: COLORS.bell,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const innerBell = new THREE.Mesh(innerBellGeometry, innerBellMaterial);
    jellyfishGroup.add(innerBell);

    // === TENTACLES ===
    const tentacles = [];
    const tentacleCount = 12;
    const tentacleLengths = [1.5, 1.5, 1.5, 1.5, 2.2, 2.2, 2.2, 2.2, 3.0, 3.0, 3.0, 3.0];
    const tentacleSegments = 40;

    for (let i = 0; i < tentacleCount; i++) {
      const angle = (i / tentacleCount) * Math.PI * 2;
      const attachRadius = 0.95;
      const attachX = Math.sin(angle) * attachRadius;
      const attachZ = Math.cos(angle) * attachRadius;
      const length = tentacleLengths[i];

      const points = [];
      const basePoints = [];
      const targetPoints = [];

      for (let j = 0; j <= tentacleSegments; j++) {
        const t = j / tentacleSegments;
        const baseY = -0.2 - t * length;
        const sway = Math.sin(angle + t * 3) * 0.3 * t;

        const point = new THREE.Vector3(
          attachX + sway,
          baseY,
          attachZ + Math.cos(angle + t * 2) * 0.2 * t
        );
        points.push(point.clone());
        basePoints.push(point.clone());
        targetPoints.push(point.clone());
      }

      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeometry = new THREE.TubeGeometry(curve, tentacleSegments, 0.02, 8, false);
      const tubeMaterial = new THREE.MeshBasicMaterial({
        color: COLORS.tentacle,
        transparent: true,
        opacity: 0.7
      });
      const tentacleMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
      jellyfishGroup.add(tentacleMesh);

      tentacles.push({
        mesh: tentacleMesh,
        points,
        basePoints,
        targetPoints,
        angle,
        length,
        noiseOffset: Math.random() * 1000
      });
    }

    // === ORAL ARMS (4 shorter, thicker, ruffled) ===
    const oralArms = [];
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const attachRadius = 0.2;
      const points = [];

      for (let j = 0; j <= 20; j++) {
        const t = j / 20;
        const spiral = t * Math.PI * 2;
        points.push(new THREE.Vector3(
          Math.cos(angle) * attachRadius + Math.sin(spiral) * 0.15 * t,
          -0.3 - t * 1.2,
          Math.sin(angle) * attachRadius + Math.cos(spiral) * 0.15 * t
        ));
      }

      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeometry = new THREE.TubeGeometry(curve, 20, 0.04, 8, false);
      const tubeMaterial = new THREE.MeshBasicMaterial({
        color: COLORS.tentacle,
        transparent: true,
        opacity: 0.8
      });
      const oralMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
      jellyfishGroup.add(oralMesh);
      oralArms.push({ mesh: oralMesh, points, angle, noiseOffset: Math.random() * 1000 });
    }

    // === BIOLUMINESCENT PARTICLES ===
    const particleCount = 50;
    const particlesGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);
    const particlePhases = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.5;
      const r = 0.3 + Math.random() * 0.5;
      particlePositions[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
      particlePositions[i * 3 + 1] = -Math.cos(phi) * r;
      particlePositions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * r;
      particleSizes[i] = 0.02 + Math.random() * 0.03;
      particlePhases[i] = Math.random() * Math.PI * 2;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      color: COLORS.accent,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    jellyfishGroup.add(particles);

    // === SIMPLE NOISE FUNCTION ===
    const noise = (x, y, z) => {
      const n = Math.sin(x * 1.3 + y * 2.1) * Math.cos(y * 1.7 + z * 2.3) * Math.sin(z * 1.9 + x * 2.7);
      return n * 0.5 + 0.5;
    };

    // === BREATH SYNC FUNCTION (exported) ===
    const setBreathePhase = (phase, progress) => {
      breathPhase = phase;
      breathProgress = progress;
    };

    // === UPDATE FUNCTION ===
    const updateJellyfish = (deltaTime, elapsed) => {
      // Bell animation based on breath
      let bellScaleY = 1.0;
      let bellScaleXZ = 1.0;
      let bellY = 0;
      let colorLerp = 0;

      if (breathPhase === 'inhale') {
        bellScaleY = 1.0 + breathProgress * 0.15;
        bellScaleXZ = 1.0 - breathProgress * 0.08;
        bellY = breathProgress * 0.1;
        colorLerp = breathProgress;
      } else if (breathPhase === 'hold') {
        const pulse = Math.sin(elapsed * 3) * 0.02;
        bellScaleY = 1.15 + pulse;
        bellScaleXZ = 0.92 - pulse * 0.5;
        bellY = 0.1;
        colorLerp = 1;
      } else { // exhale
        bellScaleY = 1.15 - breathProgress * 0.15;
        bellScaleXZ = 0.92 + breathProgress * 0.08;
        bellY = 0.1 - breathProgress * 0.15;
        colorLerp = 1 - breathProgress;
      }

      // Apply bell transformations
      bell.scale.set(bellScaleXZ, bellScaleY, bellScaleXZ);
      innerBell.scale.set(bellScaleXZ * 0.85, bellScaleY * 0.85, bellScaleXZ * 0.85);
      jellyfishGroup.position.y = bellY;

      // Constant gentle rotation for ambient life
      jellyfishGroup.rotation.y = Math.sin(elapsed * 0.2) * 0.1;
      jellyfishGroup.rotation.x = Math.sin(elapsed * 0.15) * 0.05;

      // Color transition
      const currentColor = new THREE.Color().lerpColors(COLORS.dim, COLORS.bell, colorLerp);
      bell.material.color.copy(currentColor);
      innerBell.material.color.copy(currentColor);

      // Bell flash decay
      if (bellFlashIntensity > 0) {
        bellFlashIntensity *= 0.95;
        bell.material.color.lerp(COLORS.accent, bellFlashIntensity);
      }

      // Tentacle animation
      const tentacleDelay = 0.3;
      const delayedProgress = Math.max(0, breathProgress - tentacleDelay);

      tentacles.forEach((tentacle, i) => {
        const noiseVal = noise(elapsed * 0.3 + tentacle.noiseOffset, i * 0.5, 0);
        const swayAmp = isReducedMotion ? 0.05 : (0.1 + noiseVal * 0.1);

        for (let j = 0; j < tentacle.points.length; j++) {
          const t = j / tentacle.points.length;
          const base = tentacle.basePoints[j];

          // Sway based on noise
          const swayX = Math.sin(elapsed * 0.5 + j * 0.2 + tentacle.angle) * swayAmp * t;
          const swayZ = Math.cos(elapsed * 0.4 + j * 0.3 + tentacle.noiseOffset) * swayAmp * t;

          // Breath response - flare on exhale, stream on inhale
          let breathOffset = 0;
          if (breathPhase === 'exhale') {
            breathOffset = delayedProgress * 0.3 * t;
          } else if (breathPhase === 'inhale') {
            breathOffset = -delayedProgress * 0.2 * t;
          }

          // Mouse avoidance
          let avoidX = 0, avoidZ = 0;
          const pointWorld = tentacle.points[j].clone();
          jellyfishGroup.localToWorld(pointWorld);
          const dist = pointWorld.distanceTo(mouse3D);
          if (dist < 1.5) {
            const pushStrength = (1.5 - dist) * 0.5 * t;
            const dir = pointWorld.clone().sub(mouse3D).normalize();
            avoidX = dir.x * pushStrength;
            avoidZ = dir.z * pushStrength;
          }

          tentacle.targetPoints[j].set(
            base.x + swayX + avoidX + breathOffset * Math.cos(tentacle.angle),
            base.y + (breathPhase === 'exhale' ? breathOffset * 0.5 : -breathOffset * 0.3),
            base.z + swayZ + avoidZ + breathOffset * Math.sin(tentacle.angle)
          );

          // Smooth lerp
          tentacle.points[j].lerp(tentacle.targetPoints[j], 0.04);
        }

        // Rebuild tentacle geometry
        const curve = new THREE.CatmullRomCurve3(tentacle.points);
        const newGeometry = new THREE.TubeGeometry(curve, tentacleSegments, 0.02 * (1 - 0.5 * (breathPhase === 'exhale' ? breathProgress : 0)), 8, false);
        tentacle.mesh.geometry.dispose();
        tentacle.mesh.geometry = newGeometry;

        // Update tentacle color
        const tentacleColor = new THREE.Color().lerpColors(COLORS.dim, COLORS.tentacle, colorLerp);
        tentacle.mesh.material.color.copy(tentacleColor);
      });

      // Oral arms animation
      oralArms.forEach((arm, i) => {
        for (let j = 1; j < arm.points.length; j++) {
          const t = j / arm.points.length;
          const sway = Math.sin(elapsed * 0.3 + j * 0.4 + arm.noiseOffset) * 0.08 * t;
          arm.points[j].x += sway * 0.01;
          arm.points[j].z += Math.cos(elapsed * 0.25 + j * 0.3) * 0.08 * t * 0.01;
        }
        const curve = new THREE.CatmullRomCurve3(arm.points);
        const newGeometry = new THREE.TubeGeometry(curve, 20, 0.04, 8, false);
        arm.mesh.geometry.dispose();
        arm.mesh.geometry = newGeometry;
        arm.mesh.material.color.copy(new THREE.Color().lerpColors(COLORS.dim, COLORS.tentacle, colorLerp));
      });

      // Particle shimmer
      const positions = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const shimmer = Math.sin(elapsed * 2 + particlePhases[i]) * 0.5 + 0.5;
        particleSizes[i] = (0.02 + shimmer * 0.03) * (0.5 + colorLerp * 0.5);
      }
      particles.material.opacity = 0.3 + colorLerp * 0.5;
      particles.geometry.attributes.position.needsUpdate = true;

      // Ambient drift
      if (!isReducedMotion) {
        jellyfishGroup.position.x += Math.sin(elapsed * 0.1) * 0.0002;
        jellyfishGroup.position.z += Math.cos(elapsed * 0.08) * 0.0002;
      }

      // Auto-rotate after idle
      const now = Date.now();
      if (now - lastInteractionTime > 8000 && !isReducedMotion && controls) {
        if (!isAutoRotating) {
          isAutoRotating = true;
          controls.autoRotate = true;
        }
      }

    };

    // === INTERACTION HANDLERS ===
    const onMouseMove = (event) => {
      mousePos.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePos.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mousePos, camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      raycaster.ray.intersectPlane(plane, mouse3D);

      lastInteractionTime = Date.now();
      if (isAutoRotating && controls) {
        isAutoRotating = false;
        controls.autoRotate = false;
      }
    };

    const onTouchMove = (event) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        mousePos.x = (touch.clientX / window.innerWidth) * 2 - 1;
        mousePos.y = -(touch.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mousePos, camera);
        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        raycaster.ray.intersectPlane(plane, mouse3D);
      }
      lastInteractionTime = Date.now();
    };

    const onClick = (event) => {
      raycaster.setFromCamera(mousePos, camera);
      const intersects = raycaster.intersectObject(bell);
      if (intersects.length > 0) {
        bellFlashIntensity = 1.0;
        if (navigator.vibrate) navigator.vibrate(10);
      }
      lastInteractionTime = Date.now();
    };

    const onDoubleClick = () => {
      // Reset camera
      const startPos = camera.position.clone();
      const startTarget = controls ? controls.target.clone() : new THREE.Vector3(0, 0, 0);
      const endPos = new THREE.Vector3(0, 0, 5);
      const endTarget = new THREE.Vector3(0, 0, 0);

      let t = 0;
      const animateReset = () => {
        t += 0.02;
        if (t >= 1) {
          camera.position.copy(endPos);
          if (controls) controls.target.copy(endTarget);
          return;
        }
        const ease = 1 - Math.pow(1 - t, 3);
        camera.position.lerpVectors(startPos, endPos, ease);
        if (controls) controls.target.lerpVectors(startTarget, endTarget, ease);
        requestAnimationFrame(animateReset);
      };
      animateReset();
    };

    const onKeyDown = (event) => {
      const rotateAmount = 0.1;
      switch(event.key) {
        case 'ArrowLeft':
          camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotateAmount);
          break;
        case 'ArrowRight':
          camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), -rotateAmount);
          break;
        case 'ArrowUp':
          camera.position.y += 0.2;
          break;
        case 'ArrowDown':
          camera.position.y -= 0.2;
          break;
        case '+':
        case '=':
          camera.position.multiplyScalar(0.9);
          break;
        case '-':
          camera.position.multiplyScalar(1.1);
          break;
        case ' ':
          onDoubleClick();
          break;
      }
      lastInteractionTime = Date.now();
    };

    // === RESIZE HANDLER ===
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    // === ANIMATION LOOP ===
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const deltaTime = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Update breath from app's breath cycle
      const breathCycle = getBreathPhase(elapsed);
      if (breathCycle < 0.45) {
        setBreathePhase('inhale', breathCycle / 0.45);
      } else if (breathCycle < 0.55) {
        setBreathePhase('hold', (breathCycle - 0.45) / 0.1);
      } else {
        setBreathePhase('exhale', (breathCycle - 0.55) / 0.45);
      }

      updateJellyfish(deltaTime, elapsed);
      if (controls) controls.update();
      renderer.render(scene, camera);
    };

    // === EVENT LISTENERS ===
    window.addEventListener('resize', onResize);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: true });
    renderer.domElement.addEventListener('click', onClick);
    renderer.domElement.addEventListener('dblclick', onDoubleClick);
    window.addEventListener('keydown', onKeyDown);

    // Start animation
    animate();

    // === CLEANUP ===
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('touchmove', onTouchMove);
      renderer.domElement.removeEventListener('click', onClick);
      renderer.domElement.removeEventListener('dblclick', onDoubleClick);
      window.removeEventListener('keydown', onKeyDown);

      // Dispose geometries and materials
      bell.geometry.dispose();
      bell.material.dispose();
      innerBell.geometry.dispose();
      innerBell.material.dispose();
      tentacles.forEach(t => {
        t.mesh.geometry.dispose();
        t.mesh.material.dispose();
      });
      oralArms.forEach(a => {
        a.mesh.geometry.dispose();
        a.mesh.material.dispose();
      });
      particles.geometry.dispose();
      particles.material.dispose();

      if (controls) controls.dispose();
      renderer.dispose();

      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [currentMode, getBreathPhase]);

  // ========== DEEP SEA MODE (2D Jellyfish) ==========
  React.useEffect(() => {
    if (currentMode !== 'jellyfish2d' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    // Use main PALETTE colors - teal as primary (matches other visuals)
    const JELLY_COLORS = {
      primary: { h: hue, s: 52, l: 68 },    // Main teal #7FDBCA
      deep: { h: hue, s: 50, l: 50 },       // Deeper teal
      accent: { h: hue + 15, s: 60, l: 75 },// Lighter accent
      sand: { h: hue + 20, s: 50, l: 65 }    // Accent for spots
    };

    // Thin trailing tentacle class with verlet physics
    class Tentacle {
      constructor(parent, index, totalCount, segments, segmentLength) {
        this.parent = parent;
        this.index = index;
        this.segments = segments;
        this.segmentLength = segmentLength;
        this.points = [];
        this.oldPoints = [];

        // Distribute around bell margin
        const angleOffset = (index / totalCount) * Math.PI * 2;
        this.angleOffset = angleOffset;
        const attachRadius = 0.95; // Attach at bell rim
        const startX = Math.cos(angleOffset) * parent.size * attachRadius;
        const startY = Math.sin(angleOffset) * parent.size * 0.15; // Slight vertical spread

        // Initialize with natural hanging curve
        for (let i = 0; i < segments; i++) {
          const t = i / segments;
          const sway = Math.sin(angleOffset + i * 0.2) * (5 + i * 1.5);
          this.points.push({
            x: parent.position.x + startX + sway,
            y: parent.position.y + parent.bellHeight + i * segmentLength + startY
          });
          this.oldPoints.push({
            x: this.points[i].x - sway * 0.05,
            y: this.points[i].y - 0.3
          });
        }
      }

      update(pulse, elapsed) {
        const expansion = 1 + pulse * 0.12;
        const attachRadius = 0.95;

        // First point follows bell rim
        const rimX = Math.cos(this.angleOffset) * this.parent.size * attachRadius * expansion;
        const rimY = Math.sin(this.angleOffset) * this.parent.size * 0.15;
        this.points[0].x = this.parent.position.x + rimX;
        this.points[0].y = this.parent.position.y + this.parent.bellHeight * 0.3 + rimY;

        // Verlet integration with drag
        for (let i = 1; i < this.segments; i++) {
          const p = this.points[i];
          const old = this.oldPoints[i];

          const vx = (p.x - old.x) * 0.97; // High drag for slow flow
          const vy = (p.y - old.y) * 0.97;

          old.x = p.x;
          old.y = p.y;

          p.x += vx;
          p.y += vy + 0.015; // Very gentle gravity

          // Gentle organic sway
          const swayAmp = 0.04 * (1 + i * 0.1);
          p.x += Math.sin(elapsed * 0.5 + i * 0.3 + this.index * 0.5) * swayAmp;
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

      draw(ctx, glow) {
        if (this.points.length < 2) return;

        // Draw thin tentacle with taper
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length - 1; i++) {
          const xc = (this.points[i].x + this.points[i + 1].x) / 2;
          const yc = (this.points[i].y + this.points[i + 1].y) / 2;
          ctx.quadraticCurveTo(this.points[i].x, this.points[i].y, xc, yc);
        }
        ctx.lineTo(this.points[this.points.length - 1].x, this.points[this.points.length - 1].y);

        // Gradient stroke - sage to teal at tips
        const gradient = ctx.createLinearGradient(
          this.points[0].x, this.points[0].y,
          this.points[this.points.length - 1].x, this.points[this.points.length - 1].y
        );
        gradient.addColorStop(0, `hsla(${JELLY_COLORS.primary.h}, ${JELLY_COLORS.primary.s}%, ${JELLY_COLORS.primary.l}%, ${0.4 + glow * 0.2})`);
        gradient.addColorStop(0.7, `hsla(${JELLY_COLORS.primary.h}, ${JELLY_COLORS.primary.s}%, ${JELLY_COLORS.primary.l + 10}%, ${0.25})`);
        gradient.addColorStop(1, `hsla(${JELLY_COLORS.accent.h}, ${JELLY_COLORS.accent.s}%, ${JELLY_COLORS.accent.l}%, ${0.15})`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Bioluminescent tip glow
        const tipIdx = this.points.length - 1;
        const tip = this.points[tipIdx];
        const tipGlow = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, 4);
        tipGlow.addColorStop(0, `hsla(${JELLY_COLORS.accent.h}, 60%, 70%, ${0.3 * glow})`);
        tipGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = tipGlow;
        ctx.beginPath();
        ctx.arc(tip.x, tip.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      applyForce(fx, fy, strength) {
        for (let i = 1; i < this.points.length; i++) {
          this.points[i].x += fx * strength * (i / this.points.length);
          this.points[i].y += fy * strength * (i / this.points.length);
        }
      }
    }

    // Frilly oral arm class
    class OralArm {
      constructor(parent, index, totalCount) {
        this.parent = parent;
        this.index = index;
        this.segments = 18;
        this.segmentLength = 5;
        this.points = [];
        this.oldPoints = [];
        this.frillPhases = [];

        const angleOffset = (index / totalCount) * Math.PI * 2;
        this.angleOffset = angleOffset;
        const attachRadius = 0.2;
        const startX = Math.cos(angleOffset) * parent.size * attachRadius;

        for (let i = 0; i < this.segments; i++) {
          const sway = Math.sin(angleOffset + i * 0.4) * 8;
          this.points.push({
            x: parent.position.x + startX + sway,
            y: parent.position.y + parent.bellHeight * 0.5 + i * this.segmentLength
          });
          this.oldPoints.push({
            x: this.points[i].x - sway * 0.05,
            y: this.points[i].y - 0.2
          });
          this.frillPhases.push(Math.random() * Math.PI * 2);
        }
      }

      update(pulse, elapsed) {
        const attachRadius = 0.2;
        const startX = Math.cos(this.angleOffset) * this.parent.size * attachRadius;

        this.points[0].x = this.parent.position.x + startX;
        this.points[0].y = this.parent.position.y + this.parent.bellHeight * 0.4;

        for (let i = 1; i < this.segments; i++) {
          const p = this.points[i];
          const old = this.oldPoints[i];

          const vx = (p.x - old.x) * 0.96;
          const vy = (p.y - old.y) * 0.96;

          old.x = p.x;
          old.y = p.y;

          p.x += vx;
          p.y += vy + 0.02;

          // Slower sway for oral arms
          const swayAmp = 0.08 * (1 + i * 0.05);
          p.x += Math.sin(elapsed * 0.3 + i * 0.5 + this.index * 1.2) * swayAmp;
        }

        // Constraints
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

            if (i > 1) {
              p1.x -= dx * percent;
              p1.y -= dy * percent;
            }
            p2.x += dx * percent;
            p2.y += dy * percent;
          }
        }
      }

      draw(ctx, elapsed, glow) {
        if (this.points.length < 2) return;

        // Draw frilly ribbon shape
        for (let i = 0; i < this.points.length - 1; i++) {
          const p1 = this.points[i];
          const p2 = this.points[i + 1];
          const t = i / (this.points.length - 1);

          // Width tapers and has frill
          const baseWidth = 6 * (1 - t * 0.5);
          const frillWave = Math.sin(elapsed * 1.5 + i * 0.8 + this.frillPhases[i]) * 3;
          const width = baseWidth + Math.abs(frillWave);

          // Calculate perpendicular
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const nx = -dy / len;
          const ny = dx / len;

          // Draw segment as quad
          ctx.beginPath();
          ctx.moveTo(p1.x + nx * width, p1.y + ny * width);
          ctx.lineTo(p2.x + nx * width * 0.9, p2.y + ny * width * 0.9);
          ctx.lineTo(p2.x - nx * width * 0.9, p2.y - ny * width * 0.9);
          ctx.lineTo(p1.x - nx * width, p1.y - ny * width);
          ctx.closePath();

          const alpha = (0.4 - t * 0.2) + glow * 0.15;
          ctx.fillStyle = `hsla(${JELLY_COLORS.deep.h}, ${JELLY_COLORS.deep.s}%, ${JELLY_COLORS.deep.l}%, ${alpha})`;
          ctx.fill();

          // Frill edge highlight in sand color
          ctx.strokeStyle = `hsla(${JELLY_COLORS.sand.h}, ${JELLY_COLORS.sand.s}%, ${JELLY_COLORS.sand.l}%, ${alpha * 0.6})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      applyForce(fx, fy, strength) {
        for (let i = 1; i < this.points.length; i++) {
          this.points[i].x += fx * strength * (i / this.points.length) * 0.7;
          this.points[i].y += fy * strength * (i / this.points.length) * 0.7;
        }
      }
    }

    // Jellyfish class - anatomically accurate
    class Jellyfish {
      constructor(x, y, size) {
        this.position = { x, y };
        this.size = size;
        this.bellHeight = size * 0.6; // Slightly flattened dome
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.008 + Math.random() * 0.004; // SLOW pulse
        this.driftVelocity = { x: (Math.random() - 0.5) * 0.1, y: -0.02 - Math.random() * 0.015 }; // Gentle upward drift
        this.lastPulse = 0;

        this.glow = 0.6;
        this.following = false;
        this.bellSegments = 48; // Smooth bell curve

        // Bioluminescent spots inside bell
        this.bioSpots = [];
        for (let i = 0; i < 8; i++) {
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * 0.5 + 0.2;
          this.bioSpots.push({
            angle,
            radius: r,
            size: Math.random() * 2 + 1,
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.008 + 0.004
          });
        }

        // Create many thin trailing tentacles (24-32)
        this.tentacles = [];
        const tentacleCount = 24 + Math.floor(Math.random() * 8);
        for (let i = 0; i < tentacleCount; i++) {
          // Variable lengths - some 2x, some 4x bell size
          const lengthMult = 2 + Math.random() * 2;
          const segCount = Math.floor(12 + lengthMult * 4);
          this.tentacles.push(new Tentacle(this, i, tentacleCount, segCount, 4));
        }

        // Create 4-6 frilly oral arms
        this.oralArms = [];
        const oralCount = 4 + Math.floor(Math.random() * 3);
        for (let i = 0; i < oralCount; i++) {
          this.oralArms.push(new OralArm(this, i, oralCount));
        }
      }

      update(elapsed, breathPhase) {
        // Very slow pulse synced loosely with breath
        const targetPhase = breathPhase * Math.PI;
        this.pulsePhase += (targetPhase - this.pulsePhase) * 0.01 + this.pulseSpeed;

        const pulse = Math.sin(this.pulsePhase);

        // Gentle upward thrust on pulse peak
        if (pulse > 0.9 && this.lastPulse <= 0.9) {
          this.driftVelocity.y -= 0.08 + Math.random() * 0.04;
          this.driftVelocity.x += (Math.random() - 0.5) * 0.06;
        }
        this.lastPulse = pulse;

        // Apply physics
        this.position.x += this.driftVelocity.x;
        this.position.y += this.driftVelocity.y;

        // High friction and very gentle buoyancy (rise)
        this.driftVelocity.x *= 0.998;
        this.driftVelocity.y *= 0.998;
        this.driftVelocity.y -= 0.002; // Very gentle rise (buoyancy)

        // Boundaries - wrap from top to bottom (swimming upward)
        if (this.position.y < -this.size * 4) this.position.y = canvas.height + this.size * 3;
        if (this.position.y > canvas.height + this.size * 4) this.position.y = canvas.height + this.size * 2;
        if (this.position.x < -this.size * 2) this.position.x = canvas.width + this.size;
        if (this.position.x > canvas.width + this.size * 2) this.position.x = -this.size;

        // Decay glow
        if (!this.following) this.glow = this.glow * 0.99 + 0.6 * 0.01;

        // Update appendages
        this.tentacles.forEach(t => t.update(pulse, elapsed));
        this.oralArms.forEach(o => o.update(pulse, elapsed));
      }

      draw(ctx, elapsed) {
        const pulse = Math.sin(this.pulsePhase);
        const expansion = 1 + pulse * 0.12;

        // Draw tentacles FIRST (behind everything)
        this.tentacles.forEach(t => t.draw(ctx, this.glow));

        // Draw oral arms (behind bell but in front of tentacles)
        this.oralArms.forEach(o => o.draw(ctx, elapsed, this.glow));

        ctx.save();
        ctx.translate(this.position.x, this.position.y);

        // Outer glow (bioluminescence)
        const glowGradient = ctx.createRadialGradient(0, this.bellHeight * 0.3, 0, 0, this.bellHeight * 0.3, this.size * 2);
        glowGradient.addColorStop(0, `hsla(${JELLY_COLORS.primary.h}, ${JELLY_COLORS.primary.s + 20}%, 70%, ${0.12 * this.glow})`);
        glowGradient.addColorStop(0.5, `hsla(${JELLY_COLORS.primary.h}, ${JELLY_COLORS.primary.s}%, 50%, ${0.04 * this.glow})`);
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(0, this.bellHeight * 0.3, this.size * 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw bell dome - organic curve bulging UPWARD
        ctx.beginPath();
        // Start at left rim
        ctx.moveTo(-this.size * expansion, this.bellHeight * 0.3);
        // Curve up to apex (above origin) then down to right rim
        ctx.bezierCurveTo(
          -this.size * expansion * 0.7, -this.bellHeight * 0.8 * (1 - pulse * 0.1), // left control
          this.size * expansion * 0.7, -this.bellHeight * 0.8 * (1 - pulse * 0.1),  // right control
          this.size * expansion, this.bellHeight * 0.3                               // end at right rim
        );
        // Close bottom with slight curve inward
        ctx.quadraticCurveTo(0, this.bellHeight * 0.5, -this.size * expansion, this.bellHeight * 0.3);

        // Multi-layer translucent fill
        const bellGradient = ctx.createRadialGradient(0, 0, 0, 0, this.bellHeight * 0.2, this.size * 1.2);
        bellGradient.addColorStop(0, `hsla(${JELLY_COLORS.primary.h}, ${JELLY_COLORS.primary.s - 5}%, 75%, ${0.35 + this.glow * 0.15})`);
        bellGradient.addColorStop(0.4, `hsla(${JELLY_COLORS.primary.h}, ${JELLY_COLORS.primary.s}%, 60%, ${0.25 + this.glow * 0.1})`);
        bellGradient.addColorStop(0.8, `hsla(${JELLY_COLORS.primary.h}, ${JELLY_COLORS.primary.s + 5}%, 50%, ${0.15})`);
        bellGradient.addColorStop(1, `hsla(${JELLY_COLORS.primary.h}, ${JELLY_COLORS.primary.s}%, 40%, ${0.08})`);
        ctx.fillStyle = bellGradient;
        ctx.fill();

        // Inner mesoglea layer (subsurface effect)
        ctx.save();
        ctx.scale(0.88, 0.88);
        ctx.beginPath();
        ctx.moveTo(-this.size * expansion, this.bellHeight * 0.25);
        ctx.bezierCurveTo(
          -this.size * expansion * 0.65, -this.bellHeight * 0.65 * (1 - pulse * 0.1),
          this.size * expansion * 0.65, -this.bellHeight * 0.65 * (1 - pulse * 0.1),
          this.size * expansion, this.bellHeight * 0.25
        );
        ctx.quadraticCurveTo(0, this.bellHeight * 0.4, -this.size * expansion, this.bellHeight * 0.25);

        const innerGradient = ctx.createRadialGradient(0, -this.bellHeight * 0.2, 0, 0, this.bellHeight * 0.1, this.size * 0.9);
        innerGradient.addColorStop(0, `hsla(${JELLY_COLORS.primary.h}, ${JELLY_COLORS.primary.s - 10}%, 85%, ${0.25 + this.glow * 0.2})`);
        innerGradient.addColorStop(0.6, `hsla(${JELLY_COLORS.primary.h}, ${JELLY_COLORS.primary.s}%, 70%, ${0.12})`);
        innerGradient.addColorStop(1, `hsla(${JELLY_COLORS.primary.h}, ${JELLY_COLORS.primary.s + 5}%, 55%, ${0.05})`);
        ctx.fillStyle = innerGradient;
        ctx.fill();
        ctx.restore();

        // Radial canals (4 visible internal lines)
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(0, -this.bellHeight * 0.3);
          const endX = Math.cos(angle) * this.size * 0.75 * expansion;
          const endY = this.bellHeight * 0.2;
          const ctrlX = Math.cos(angle) * this.size * 0.4;
          const ctrlY = 0;
          ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
          ctx.strokeStyle = `hsla(${JELLY_COLORS.primary.h + 10}, 35%, 75%, ${0.2 + this.glow * 0.1})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        ctx.globalCompositeOperation = 'source-over';

        // Gonads (4 horseshoe organs)
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
          const cx = Math.cos(angle) * this.size * 0.4;
          const cy = -this.bellHeight * 0.1 + Math.sin(angle) * this.size * 0.08;

          ctx.beginPath();
          ctx.arc(cx, cy, this.size * 0.15, Math.PI * 0.3, Math.PI * 0.7, false);
          ctx.strokeStyle = `hsla(${JELLY_COLORS.sand.h}, ${JELLY_COLORS.sand.s}%, ${JELLY_COLORS.sand.l}%, ${0.4 + this.glow * 0.2})`;
          ctx.lineWidth = this.size * 0.06;
          ctx.lineCap = 'round';
          ctx.stroke();

          // Gonad glow
          const gonadGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, this.size * 0.2);
          gonadGlow.addColorStop(0, `hsla(${JELLY_COLORS.sand.h}, ${JELLY_COLORS.sand.s + 10}%, 75%, ${0.2 * this.glow})`);
          gonadGlow.addColorStop(1, 'transparent');
          ctx.fillStyle = gonadGlow;
          ctx.beginPath();
          ctx.arc(cx, cy, this.size * 0.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Bioluminescent spots (pulsing)
        ctx.globalCompositeOperation = 'lighter';
        this.bioSpots.forEach(spot => {
          const spotPulse = Math.sin(elapsed * spot.speed * 60 + spot.phase) * 0.5 + 0.5;
          const x = Math.cos(spot.angle) * this.size * spot.radius * expansion * 0.6;
          const y = -this.bellHeight * spot.radius * 0.4;

          const spotGlow = ctx.createRadialGradient(x, y, 0, x, y, spot.size * 4);
          spotGlow.addColorStop(0, `hsla(${JELLY_COLORS.sand.h}, 70%, 85%, ${0.35 * spotPulse * this.glow})`);
          spotGlow.addColorStop(0.5, `hsla(${JELLY_COLORS.primary.h}, 50%, 65%, ${0.12 * spotPulse})`);
          spotGlow.addColorStop(1, 'transparent');
          ctx.fillStyle = spotGlow;
          ctx.beginPath();
          ctx.arc(x, y, spot.size * 4, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalCompositeOperation = 'source-over';

        // Bell rim (margin) - thicker, more opaque
        ctx.beginPath();
        ctx.moveTo(-this.size * expansion, this.bellHeight * 0.3);
        ctx.bezierCurveTo(
          -this.size * expansion * 0.7, -this.bellHeight * 0.8 * (1 - pulse * 0.1),
          this.size * expansion * 0.7, -this.bellHeight * 0.8 * (1 - pulse * 0.1),
          this.size * expansion, this.bellHeight * 0.3
        );
        ctx.strokeStyle = `hsla(${JELLY_COLORS.primary.h}, ${JELLY_COLORS.primary.s + 10}%, 80%, ${0.5 + this.glow * 0.25})`;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Subtle outer glow on rim
        ctx.strokeStyle = `hsla(${JELLY_COLORS.primary.h}, ${JELLY_COLORS.primary.s}%, 70%, ${0.15 + this.glow * 0.1})`;
        ctx.lineWidth = 6;
        ctx.stroke();

        ctx.restore();
      }

      applyForce(fx, fy) {
        this.driftVelocity.x += fx * 0.5;
        this.driftVelocity.y += fy * 0.5;
        this.tentacles.forEach(t => t.applyForce(fx, fy, 1.5));
        this.oralArms.forEach(o => o.applyForce(fx, fy, 1));
      }
    }

    // Plankton particle class
    class Plankton {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.3;
        this.speed = Math.random() * 0.15 + 0.05;
        this.angle = Math.random() * Math.PI * 2;
        this.wobble = Math.random() * Math.PI * 2;
        this.opacity = Math.random() * 0.3 + 0.1;
      }

      update(elapsed) {
        this.wobble += 0.01;
        this.x += Math.cos(this.angle + Math.sin(this.wobble) * 0.3) * this.speed;
        this.y += Math.sin(this.angle) * this.speed * 0.3 - 0.05;

        if (this.y < -10) { this.y = canvas.height + 10; this.x = Math.random() * canvas.width; }
        if (this.x < -10) this.x = canvas.width + 10;
        if (this.x > canvas.width + 10) this.x = -10;
      }

      draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${JELLY_COLORS.primary.h}, 40%, 60%, ${this.opacity})`;
        ctx.fill();
      }
    }

    // Initialize - fewer jellyfish, larger and more majestic, starting from bottom
    const jellies = [];
    const jellyCount = Math.min(Math.floor(canvas.width / 400) + 1, 3);
    for (let i = 0; i < jellyCount; i++) {
      jellies.push(new Jellyfish(
        canvas.width * 0.2 + Math.random() * canvas.width * 0.6,
        canvas.height * 0.6 + Math.random() * canvas.height * 0.3 + i * 80,  // Start visible, in lower portion
        70 + Math.random() * 40
      ));
    }

    const plankton = [];
    for (let i = 0; i < 40; i++) {
      plankton.push(new Plankton());
    }

    // Water currents from touch
    const currents = [];

    // God rays
    const rays = [];
    for (let i = 0; i < 4; i++) {
      rays.push({
        x: Math.random() * canvas.width,
        width: Math.random() * 80 + 40,
        opacity: Math.random() * 0.04 + 0.01,
        speed: Math.random() * 0.1 + 0.05
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

      // Background gradient (dark, matching app theme)
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, '#080a0c');
      bgGradient.addColorStop(0.5, '#040606');
      bgGradient.addColorStop(1, '#020303');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // God rays (teal-tinted)
      ctx.globalCompositeOperation = 'lighter';
      rays.forEach(ray => {
        ray.x += ray.speed;
        if (ray.x > canvas.width + ray.width) ray.x = -ray.width;

        const rayGradient = ctx.createLinearGradient(ray.x, 0, ray.x + ray.width, canvas.height);
        rayGradient.addColorStop(0, `rgba(127, 180, 170, ${ray.opacity * (0.7 + breath * 0.3)})`);
        rayGradient.addColorStop(0.3, `rgba(80, 140, 130, ${ray.opacity * 0.5})`);
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
        jelly.draw(ctx, elapsed);
      });

      // Touch ripples
      drawRipples(ctx);
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

    // Ink colors - using palette colors
    const inkColors = [
      { r: 0.5, g: 0.86, b: 0.79 },   // Teal (palette)
      { r: 0.48, g: 0.41, b: 0.93 },  // Purple (palette)
      { r: 0.29, g: 0.56, b: 0.64 },  // Steel Blue (palette)
      { r: 0.42, g: 0.56, b: 0.42 },  // Sage (palette)
      { r: 0.88, g: 0.48, b: 0.33 },  // Orange (palette)
      { r: 0.83, g: 0.65, b: 0.45 },  // Sand (palette)
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
        this.hue = hue + Math.random() * 20 - 10; // Teal with slight variation
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
  }, [currentMode, getInteractionInfluence, drawRipples, hue]);

  // ========== HYPER-REALISTIC LAVA LAMP MODE ==========
  // Authentic lava lamp physics with subsurface scattering, caustics, and heat shimmer
  React.useEffect(() => {
    if (currentMode !== 'lava' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    // Lamp dimensions - classic proportions
    const centerX = canvas.width / 2;
    const lampHeight = Math.min(canvas.height * 0.82, 680);
    const lampWidth = lampHeight * 0.24;
    const lampTop = (canvas.height - lampHeight) / 2;
    const lampBottom = lampTop + lampHeight;

    // Glass bottle dimensions (elegant tapered shape)
    const glassTop = lampTop + lampHeight * 0.065;
    const glassBottom = lampBottom - lampHeight * 0.105;
    const glassHeight = glassBottom - glassTop;
    const bottleNeckTop = glassTop;
    const bottleNeckWidth = lampWidth * 0.30;
    const bottleBulgeStart = glassTop + glassHeight * 0.10;
    const bottleBulgeWidth = lampWidth;
    const bottleBottomWidth = lampWidth * 0.80;

    // Heat zones for realistic convection
    const heatZoneTop = glassBottom - glassHeight * 0.14;
    const coolZoneBottom = glassTop + glassHeight * 0.18;

    // Use dynamic color scheme for wax
    const waxHueBase = hue;
    const liquidHue = (hue + 15) % 360; // Slight offset for liquid tint

    // Caustic pattern data
    const causticPatterns = [];
    for (let i = 0; i < 12; i++) {
      causticPatterns.push({
        x: Math.random(),
        y: Math.random(),
        size: 0.02 + Math.random() * 0.04,
        speed: 0.0002 + Math.random() * 0.0003,
        phase: Math.random() * Math.PI * 2,
        intensity: 0.3 + Math.random() * 0.5
      });
    }

    // Heat shimmer wave data
    const shimmerWaves = [];
    for (let i = 0; i < 8; i++) {
      shimmerWaves.push({
        frequency: 0.02 + Math.random() * 0.03,
        amplitude: 1 + Math.random() * 2,
        speed: 0.002 + Math.random() * 0.003,
        phase: Math.random() * Math.PI * 2
      });
    }

    // Enhanced wax blob class with realistic physics
    class WaxBlob {
      constructor(x, y, radius, fromPool = false) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.baseRadius = radius;
        this.radius = radius;
        this.temperature = fromPool ? 0.85 : 0.25 + Math.random() * 0.35;
        this.phase = Math.random() * Math.PI * 2;
        this.wobblePhase = Math.random() * Math.PI * 2;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.stretchY = 1;
        this.age = 0;
        this.rising = fromPool;
        this.hueOffset = (Math.random() - 0.5) * 15; // Individual color variation
        this.glowIntensity = 0.5 + Math.random() * 0.3;
        // Subsurface scattering simulation
        this.sssDepth = 0.6 + Math.random() * 0.3;
        this.innerBrightness = 0.7 + Math.random() * 0.2;
      }

      getWidthAtY(y) {
        const relY = (y - glassTop) / glassHeight;
        if (relY < 0.10) {
          const t = relY / 0.10;
          return bottleNeckWidth * 0.48 + (bottleBulgeWidth * 0.38 - bottleNeckWidth * 0.48) * t;
        } else if (relY < 0.90) {
          const t = (relY - 0.10) / 0.80;
          const bulge = Math.sin(t * Math.PI);
          return bottleBulgeWidth * 0.40 + bulge * bottleBulgeWidth * 0.14;
        } else {
          const t = (relY - 0.90) / 0.10;
          return bottleBulgeWidth * 0.40 * (1 - t * 0.12);
        }
      }

      update(dt, elapsed) {
        this.age += dt;
        const relY = (this.y - glassTop) / glassHeight;

        // Realistic heat transfer with gradual transitions
        if (this.y > heatZoneTop) {
          // Heat zone - heating from bulb
          const heatRate = 0.003 * (1 + (this.y - heatZoneTop) / (glassBottom - heatZoneTop) * 0.5);
          this.temperature = Math.min(1, this.temperature + heatRate * dt);
        } else if (this.y < coolZoneBottom) {
          // Cooling zone at top
          const coolRate = 0.0025 * (1 - this.y / coolZoneBottom);
          this.temperature = Math.max(0, this.temperature - coolRate * dt);
        } else {
          // Middle - gradual equilibrium
          const targetTemp = 0.35 + (1 - relY) * 0.25;
          this.temperature += (targetTemp - this.temperature) * 0.0003 * dt;
        }

        // Buoyancy physics - heated wax expands and rises
        const densityDiff = (this.temperature - 0.45);
        const buoyancy = -densityDiff * 0.0009 * dt;
        this.vy += buoyancy;

        // Viscous damping (lava lamps are very slow)
        this.vy *= 0.9935;
        this.vx *= 0.988;

        // Gentle convection currents
        this.wobblePhase += 0.0005 * dt;
        const convectionForce = Math.sin(this.wobblePhase + this.phase) * 0.00006;
        this.vx += convectionForce * dt * (1 + this.temperature * 0.3);

        // Apply velocity
        this.y += this.vy;
        this.x += this.vx;

        // Dynamic stretching based on motion
        const speed = Math.abs(this.vy);
        const targetStretch = 1 + speed * 12;
        this.stretchY += (Math.min(1.8, Math.max(0.65, targetStretch)) - this.stretchY) * 0.1;

        // Constrain to lamp bounds with soft bouncing
        const maxWidth = this.getWidthAtY(this.y);
        const leftBound = centerX - maxWidth + this.radius * 0.75;
        const rightBound = centerX + maxWidth - this.radius * 0.75;
        if (this.x < leftBound) { this.x = leftBound; this.vx = Math.abs(this.vx) * 0.25; }
        if (this.x > rightBound) { this.x = rightBound; this.vx = -Math.abs(this.vx) * 0.25; }

        // Vertical bounds
        const topBound = glassTop + glassHeight * 0.09 + this.radius;
        const bottomBound = glassBottom - this.radius * 0.4;
        if (this.y < topBound) {
          this.y = topBound;
          this.vy = Math.abs(this.vy) * 0.15;
          this.temperature *= 0.90;
        }
        if (this.y > bottomBound) {
          this.y = bottomBound;
          this.vy = -Math.abs(this.vy) * 0.12;
        }

        // Temperature-based expansion
        const tempExpansion = 1 + this.temperature * 0.25;
        this.radius = this.baseRadius * tempExpansion;

        // Organic pulsing
        this.phase += 0.00025 * dt;
        this.pulsePhase += 0.0004 * dt;
        this.radius *= (0.94 + Math.sin(this.phase) * 0.06 + Math.sin(this.pulsePhase * 1.7) * 0.03);
      }
    }

    // Initialize blobs
    const blobs = [];

    // Pool blobs at bottom
    for (let i = 0; i < 4; i++) {
      const x = centerX + (Math.random() - 0.5) * lampWidth * 0.45;
      const y = glassBottom - 18 - Math.random() * 28;
      blobs.push(new WaxBlob(x, y, 20 + Math.random() * 16, true));
    }

    // Floating blobs
    for (let i = 0; i < 4; i++) {
      const x = centerX + (Math.random() - 0.5) * lampWidth * 0.35;
      const y = glassTop + glassHeight * 0.22 + Math.random() * glassHeight * 0.50;
      const blob = new WaxBlob(x, y, 16 + Math.random() * 20);
      blob.temperature = 0.28 + Math.random() * 0.38;
      blobs.push(blob);
    }

    // Enhanced metaball field calculation
    const getFieldValue = (px, py) => {
      let sum = 0;
      for (const blob of blobs) {
        const dx = px - blob.x;
        const dy = (py - blob.y) / blob.stretchY;
        const distSq = dx * dx + dy * dy;
        if (distSq > 0.1) {
          // Smoother falloff for better merging
          const r = blob.radius * 1.1;
          sum += (r * r) / distSq;
        }
      }
      return sum;
    };

    // Draw heat shimmer distortion effect
    const drawHeatShimmer = (elapsed) => {
      // Create subtle wavy distortion lines in the liquid
      ctx.save();
      ctx.globalAlpha = 0.03;

      for (let y = glassTop + 30; y < glassBottom - 50; y += 8) {
        const relY = (y - glassTop) / glassHeight;
        const width = bottleBulgeWidth * (0.3 + Math.sin(relY * Math.PI) * 0.15);

        ctx.beginPath();
        ctx.moveTo(centerX - width, y);

        let totalDisplace = 0;
        for (const wave of shimmerWaves) {
          totalDisplace += Math.sin(y * wave.frequency + elapsed * wave.speed + wave.phase) * wave.amplitude;
        }

        for (let x = centerX - width; x <= centerX + width; x += 4) {
          const localDisplace = Math.sin((x - centerX) * 0.05 + elapsed * 0.003) * 1.5;
          ctx.lineTo(x, y + totalDisplace * 0.3 + localDisplace);
        }

        ctx.strokeStyle = `hsla(${liquidHue}, 30%, 70%, 0.15)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();
    };

    // Draw caustic light patterns
    const drawCaustics = (elapsed, breath) => {
      ctx.save();

      for (const caustic of causticPatterns) {
        const cx = centerX + (caustic.x - 0.5) * lampWidth * 0.7;
        const baseY = glassTop + caustic.y * glassHeight * 0.85;
        const cy = baseY + Math.sin(elapsed * caustic.speed + caustic.phase) * 30;
        const size = caustic.size * lampWidth * (1 + breath * 0.2);

        // Caustic light ripple
        const causticGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size);
        const intensity = caustic.intensity * (0.15 + breath * 0.1);
        causticGrad.addColorStop(0, `hsla(${waxHueBase + 15}, 70%, 75%, ${intensity})`);
        causticGrad.addColorStop(0.4, `hsla(${waxHueBase + 5}, 60%, 60%, ${intensity * 0.5})`);
        causticGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = causticGrad;
        ctx.beginPath();
        // Slightly warped caustic shape
        ctx.ellipse(
          cx, cy,
          size * (1 + Math.sin(elapsed * 0.002 + caustic.phase) * 0.3),
          size * (1 + Math.cos(elapsed * 0.0015 + caustic.phase) * 0.2),
          elapsed * 0.0005 + caustic.phase,
          0, Math.PI * 2
        );
        ctx.fill();
      }

      ctx.restore();
    };

    // Draw smooth organic blobs with subsurface scattering
    const drawOrganicBlobs = (elapsed, breath) => {
      // Sort by y for proper layering
      const sortedBlobs = [...blobs].sort((a, b) => b.y - a.y);

      sortedBlobs.forEach(blob => {
        const tempFactor = blob.temperature;
        // Warm color palette: cooler blobs are more red, hotter are more orange/yellow
        const blobHue = waxHueBase + blob.hueOffset + tempFactor * 25;
        const saturation = 75 + tempFactor * 15;
        const baseBrightness = 35 + tempFactor * 30;

        ctx.save();
        ctx.translate(blob.x, blob.y);
        ctx.scale(1, 1 / blob.stretchY);

        // Create organic blob shape with smooth bezier curves
        const points = 12;
        const controlPoints = [];
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const wobble = 1 +
            Math.sin(angle * 3 + blob.phase) * 0.10 +
            Math.sin(angle * 5 + blob.wobblePhase) * 0.05 +
            Math.sin(angle * 7 + elapsed * 0.001) * 0.03;
          const r = blob.radius * wobble;
          controlPoints.push({
            x: Math.cos(angle) * r,
            y: Math.sin(angle) * r
          });
        }

        // Draw with smooth bezier curves
        ctx.beginPath();
        ctx.moveTo(controlPoints[0].x, controlPoints[0].y);
        for (let i = 0; i < controlPoints.length - 1; i++) {
          const p0 = controlPoints[i];
          const p1 = controlPoints[i + 1];
          const midX = (p0.x + p1.x) / 2;
          const midY = (p0.y + p1.y) / 2;
          ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
        }
        ctx.closePath();

        // Multiple gradient layers for depth and subsurface scattering effect

        // 1. Base fill with warm gradient
        const baseGrad = ctx.createRadialGradient(
          -blob.radius * 0.3, -blob.radius * 0.35, 0,
          0, 0, blob.radius * 1.3
        );
        baseGrad.addColorStop(0, `hsla(${blobHue + 12}, ${saturation}%, ${baseBrightness + 25}%, 0.98)`);
        baseGrad.addColorStop(0.25, `hsla(${blobHue + 6}, ${saturation - 5}%, ${baseBrightness + 15}%, 0.97)`);
        baseGrad.addColorStop(0.55, `hsla(${blobHue}, ${saturation - 10}%, ${baseBrightness + 5}%, 0.95)`);
        baseGrad.addColorStop(0.8, `hsla(${blobHue - 8}, ${saturation - 15}%, ${baseBrightness - 8}%, 0.92)`);
        baseGrad.addColorStop(1, `hsla(${blobHue - 15}, ${saturation - 20}%, ${baseBrightness - 15}%, 0.88)`);
        ctx.fillStyle = baseGrad;
        ctx.fill();

        // 2. Subsurface scattering - internal glow
        const sssGrad = ctx.createRadialGradient(
          blob.radius * 0.15, blob.radius * 0.1, blob.radius * 0.1,
          0, 0, blob.radius * 0.85
        );
        const sssIntensity = blob.sssDepth * (0.3 + tempFactor * 0.3);
        sssGrad.addColorStop(0, `hsla(${blobHue + 20}, 80%, 80%, ${sssIntensity})`);
        sssGrad.addColorStop(0.4, `hsla(${blobHue + 10}, 70%, 65%, ${sssIntensity * 0.5})`);
        sssGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = sssGrad;
        ctx.fill();

        // 3. Bright inner core (light passing through)
        const coreGrad = ctx.createRadialGradient(
          -blob.radius * 0.15, -blob.radius * 0.2, 0,
          0, 0, blob.radius * 0.5
        );
        const coreIntensity = blob.innerBrightness * (0.25 + tempFactor * 0.2 + breath * 0.1);
        coreGrad.addColorStop(0, `hsla(${blobHue + 25}, 85%, 90%, ${coreIntensity})`);
        coreGrad.addColorStop(0.5, `hsla(${blobHue + 15}, 75%, 75%, ${coreIntensity * 0.4})`);
        coreGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = coreGrad;
        ctx.fill();

        // 4. Surface highlight (specular)
        const specGrad = ctx.createRadialGradient(
          -blob.radius * 0.4, -blob.radius * 0.45, 0,
          -blob.radius * 0.3, -blob.radius * 0.35, blob.radius * 0.35
        );
        specGrad.addColorStop(0, `rgba(255, 255, 255, ${0.35 + breath * 0.1})`);
        specGrad.addColorStop(0.5, `rgba(255, 230, 200, ${0.15})`);
        specGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = specGrad;
        ctx.fill();

        // 5. Rim light effect
        ctx.beginPath();
        ctx.arc(0, 0, blob.radius * 0.92, -Math.PI * 0.75, -Math.PI * 0.25);
        ctx.strokeStyle = `rgba(255, 240, 220, ${0.15 + tempFactor * 0.1})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();

        // Outer glow around blob
        const outerGlow = ctx.createRadialGradient(
          blob.x, blob.y, blob.radius * 0.8,
          blob.x, blob.y, blob.radius * 2.2
        );
        const glowStrength = blob.glowIntensity * (0.12 + tempFactor * 0.15 + breath * 0.05);
        outerGlow.addColorStop(0, `hsla(${blobHue}, 70%, 60%, ${glowStrength})`);
        outerGlow.addColorStop(0.5, `hsla(${blobHue - 5}, 60%, 50%, ${glowStrength * 0.4})`);
        outerGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.ellipse(blob.x, blob.y, blob.radius * 2.2, blob.radius * 2.2 / blob.stretchY, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw stretchy bridges between close blobs
      for (let i = 0; i < blobs.length; i++) {
        for (let j = i + 1; j < blobs.length; j++) {
          const b1 = blobs[i];
          const b2 = blobs[j];
          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const mergeThreshold = (b1.radius + b2.radius) * 2.0;

          if (dist < mergeThreshold && dist > b1.radius * 0.4) {
            const strength = Math.pow(1 - dist / mergeThreshold, 1.5);
            const midX = (b1.x + b2.x) / 2;
            const midY = (b1.y + b2.y) / 2;
            const angle = Math.atan2(dy, dx);

            const bridgeWidth1 = b1.radius * 0.65 * strength;
            const bridgeWidth2 = b2.radius * 0.65 * strength;
            const neckWidth = Math.min(bridgeWidth1, bridgeWidth2) * 0.25 * strength;

            ctx.save();
            ctx.translate(midX, midY);
            ctx.rotate(angle);

            const halfDist = dist / 2;

            // Bridge with gradient
            ctx.beginPath();
            ctx.moveTo(-halfDist, -bridgeWidth1);
            ctx.bezierCurveTo(
              -halfDist * 0.3, -neckWidth * 1.2,
              halfDist * 0.3, -neckWidth * 1.2,
              halfDist, -bridgeWidth2
            );
            ctx.lineTo(halfDist, bridgeWidth2);
            ctx.bezierCurveTo(
              halfDist * 0.3, neckWidth * 1.2,
              -halfDist * 0.3, neckWidth * 1.2,
              -halfDist, bridgeWidth1
            );
            ctx.closePath();

            const avgTemp = (b1.temperature + b2.temperature) / 2;
            const bridgeHue = waxHueBase + (b1.hueOffset + b2.hueOffset) / 2 + avgTemp * 20;
            const bridgeBrightness = 40 + avgTemp * 25;

            const bridgeGrad = ctx.createLinearGradient(-halfDist, 0, halfDist, 0);
            bridgeGrad.addColorStop(0, `hsla(${bridgeHue}, 70%, ${bridgeBrightness + 10}%, ${0.92 * strength})`);
            bridgeGrad.addColorStop(0.5, `hsla(${bridgeHue + 5}, 75%, ${bridgeBrightness + 15}%, ${0.95 * strength})`);
            bridgeGrad.addColorStop(1, `hsla(${bridgeHue}, 70%, ${bridgeBrightness + 10}%, ${0.92 * strength})`);
            ctx.fillStyle = bridgeGrad;
            ctx.fill();

            ctx.restore();
          }
        }
      }
    };

    // Draw wax pool at bottom with enhanced effects
    const drawWaxPool = (elapsed, breath) => {
      const poolTop = glassBottom - 50;

      // Animated wavy surface
      ctx.beginPath();
      ctx.moveTo(centerX - lampWidth * 0.44, glassBottom);

      const wavePoints = 24;
      for (let i = 0; i <= wavePoints; i++) {
        const t = i / wavePoints;
        const x = centerX - lampWidth * 0.44 + t * lampWidth * 0.88;
        const wave = Math.sin(t * Math.PI * 5 + elapsed * 0.002) * 2.5 +
                     Math.sin(t * Math.PI * 3 + elapsed * 0.0015) * 1.5 +
                     Math.sin(t * Math.PI * 8 + elapsed * 0.003) * 1;
        ctx.lineTo(x, poolTop + wave);
      }

      ctx.lineTo(centerX + lampWidth * 0.44, glassBottom);
      ctx.closePath();

      // Rich warm gradient for pool
      const poolGrad = ctx.createLinearGradient(0, poolTop - 10, 0, glassBottom);
      poolGrad.addColorStop(0, `hsla(${waxHueBase + 8}, 75%, 55%, 0.96)`);
      poolGrad.addColorStop(0.3, `hsla(${waxHueBase + 3}, 70%, 48%, 0.97)`);
      poolGrad.addColorStop(0.6, `hsla(${waxHueBase - 5}, 65%, 40%, 0.98)`);
      poolGrad.addColorStop(1, `hsla(${waxHueBase - 12}, 60%, 32%, 0.99)`);
      ctx.fillStyle = poolGrad;
      ctx.fill();

      // Surface highlight with shimmer
      ctx.beginPath();
      for (let i = 0; i <= wavePoints; i++) {
        const t = i / wavePoints;
        const x = centerX - lampWidth * 0.38 + t * lampWidth * 0.76;
        const wave = Math.sin(t * Math.PI * 5 + elapsed * 0.002) * 2.5 +
                     Math.sin(t * Math.PI * 3 + elapsed * 0.0015) * 1.5;
        const y = poolTop + wave + 3;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `hsla(${waxHueBase + 20}, 80%, 75%, ${0.35 + breath * 0.15})`;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Heat glow from pool surface
      const heatGlow = ctx.createLinearGradient(0, poolTop - 20, 0, poolTop + 30);
      heatGlow.addColorStop(0, 'transparent');
      heatGlow.addColorStop(0.5, `hsla(${waxHueBase + 15}, 70%, 60%, ${0.08 + breath * 0.04})`);
      heatGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = heatGlow;
      ctx.fillRect(centerX - lampWidth * 0.5, poolTop - 20, lampWidth, 50);
    };

    // Draw chrome/metallic base with realistic lighting
    const drawChromeBase = (breath) => {
      const baseHeight = lampHeight * 0.105;
      const baseTop = lampBottom - baseHeight;
      const baseWidthTop = lampWidth * 0.30;
      const baseWidthBottom = lampWidth * 0.55;

      // Main chrome body with multiple gradient layers
      ctx.beginPath();
      ctx.moveTo(centerX - baseWidthTop, baseTop);
      ctx.lineTo(centerX - baseWidthBottom, lampBottom);
      ctx.lineTo(centerX + baseWidthBottom, lampBottom);
      ctx.lineTo(centerX + baseWidthTop, baseTop);
      ctx.closePath();

      // Chrome gradient with realistic reflections
      const chromeGrad = ctx.createLinearGradient(centerX - baseWidthBottom, 0, centerX + baseWidthBottom, 0);
      chromeGrad.addColorStop(0, '#1a1a1a');
      chromeGrad.addColorStop(0.15, '#3d3d3d');
      chromeGrad.addColorStop(0.25, '#5a5a5a');
      chromeGrad.addColorStop(0.35, '#707070');
      chromeGrad.addColorStop(0.45, '#8a8a8a');
      chromeGrad.addColorStop(0.5, '#a0a0a0');
      chromeGrad.addColorStop(0.55, '#8a8a8a');
      chromeGrad.addColorStop(0.65, '#707070');
      chromeGrad.addColorStop(0.75, '#5a5a5a');
      chromeGrad.addColorStop(0.85, '#3d3d3d');
      chromeGrad.addColorStop(1, '#1a1a1a');
      ctx.fillStyle = chromeGrad;
      ctx.fill();

      // Vertical chrome gradient overlay
      const vertGrad = ctx.createLinearGradient(0, baseTop, 0, lampBottom);
      vertGrad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
      vertGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.05)');
      vertGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.1)');
      vertGrad.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
      ctx.fillStyle = vertGrad;
      ctx.fill();

      // Warm reflection from lamp glow on chrome
      const warmReflect = ctx.createLinearGradient(0, baseTop - 10, 0, baseTop + 20);
      warmReflect.addColorStop(0, `hsla(${waxHueBase}, 60%, 50%, ${0.15 + breath * 0.08})`);
      warmReflect.addColorStop(1, 'transparent');
      ctx.fillStyle = warmReflect;
      ctx.fillRect(centerX - baseWidthTop, baseTop, baseWidthTop * 2, 25);

      // Top rim highlight
      ctx.beginPath();
      ctx.moveTo(centerX - baseWidthTop + 2, baseTop);
      ctx.lineTo(centerX + baseWidthTop - 2, baseTop);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Bottom rim shadow
      ctx.beginPath();
      ctx.moveTo(centerX - baseWidthBottom + 3, lampBottom - 1);
      ctx.lineTo(centerX + baseWidthBottom - 3, lampBottom - 1);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Heat glow emanating from base
      const heatGlow = ctx.createRadialGradient(
        centerX, baseTop + 5, 0,
        centerX, baseTop - 30, lampWidth * 0.6
      );
      heatGlow.addColorStop(0, `hsla(30, 90%, 55%, ${0.20 + breath * 0.08})`);
      heatGlow.addColorStop(0.3, `hsla(${waxHueBase}, 75%, 45%, ${0.12 + breath * 0.05})`);
      heatGlow.addColorStop(0.6, `hsla(${waxHueBase}, 60%, 35%, ${0.05})`);
      heatGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = heatGlow;
      ctx.beginPath();
      ctx.ellipse(centerX, baseTop, lampWidth * 0.6, lampWidth * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    // Draw chrome cap with realistic lighting
    const drawChromeCap = (breath) => {
      const capHeight = lampHeight * 0.065;
      const capWidthBottom = bottleNeckWidth * 0.48;
      const capWidthTop = lampWidth * 0.24;

      ctx.beginPath();
      ctx.moveTo(centerX - capWidthBottom, glassTop);
      ctx.bezierCurveTo(
        centerX - capWidthBottom * 1.1, lampTop + capHeight * 0.4,
        centerX - capWidthTop * 1.2, lampTop + capHeight * 0.15,
        centerX - capWidthTop, lampTop
      );
      ctx.lineTo(centerX + capWidthTop, lampTop);
      ctx.bezierCurveTo(
        centerX + capWidthTop * 1.2, lampTop + capHeight * 0.15,
        centerX + capWidthBottom * 1.1, lampTop + capHeight * 0.4,
        centerX + capWidthBottom, glassTop
      );
      ctx.closePath();

      // Chrome gradient
      const capGrad = ctx.createLinearGradient(centerX - capWidthBottom, 0, centerX + capWidthBottom, 0);
      capGrad.addColorStop(0, '#1a1a1a');
      capGrad.addColorStop(0.2, '#4a4a4a');
      capGrad.addColorStop(0.35, '#6a6a6a');
      capGrad.addColorStop(0.5, '#8a8a8a');
      capGrad.addColorStop(0.65, '#6a6a6a');
      capGrad.addColorStop(0.8, '#4a4a4a');
      capGrad.addColorStop(1, '#1a1a1a');
      ctx.fillStyle = capGrad;
      ctx.fill();

      // Vertical highlight
      const vertGrad = ctx.createLinearGradient(0, lampTop, 0, glassTop);
      vertGrad.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
      vertGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.04)');
      vertGrad.addColorStop(1, 'rgba(0, 0, 0, 0.08)');
      ctx.fillStyle = vertGrad;
      ctx.fill();

      // Warm ambient reflection
      ctx.fillStyle = `hsla(${waxHueBase}, 50%, 50%, ${0.08 + breath * 0.04})`;
      ctx.fill();
    };

    // Draw glass bottle with enhanced reflections
    const drawGlassBottle = () => {
      ctx.save();
      ctx.beginPath();

      // Bottle shape path
      ctx.moveTo(centerX - bottleNeckWidth * 0.36, bottleNeckTop);
      ctx.quadraticCurveTo(
        centerX - bottleNeckWidth * 0.40, bottleBulgeStart,
        centerX - bottleBulgeWidth * 0.44, bottleBulgeStart + glassHeight * 0.12
      );
      ctx.quadraticCurveTo(
        centerX - bottleBulgeWidth * 0.48, glassTop + glassHeight * 0.5,
        centerX - bottleBottomWidth * 0.40, glassBottom - glassHeight * 0.05
      );
      ctx.quadraticCurveTo(
        centerX, glassBottom + 3,
        centerX + bottleBottomWidth * 0.40, glassBottom - glassHeight * 0.05
      );
      ctx.quadraticCurveTo(
        centerX + bottleBulgeWidth * 0.48, glassTop + glassHeight * 0.5,
        centerX + bottleBulgeWidth * 0.44, bottleBulgeStart + glassHeight * 0.12
      );
      ctx.quadraticCurveTo(
        centerX + bottleNeckWidth * 0.40, bottleBulgeStart,
        centerX + bottleNeckWidth * 0.36, bottleNeckTop
      );
      ctx.closePath();
      ctx.clip();

      // Golden-tinted liquid interior
      const interiorGrad = ctx.createLinearGradient(centerX - lampWidth/2, glassTop, centerX + lampWidth/2, glassTop);
      interiorGrad.addColorStop(0, 'rgba(15, 12, 8, 0.96)');
      interiorGrad.addColorStop(0.3, `hsla(${liquidHue}, 25%, 8%, 0.94)`);
      interiorGrad.addColorStop(0.5, `hsla(${liquidHue}, 20%, 10%, 0.93)`);
      interiorGrad.addColorStop(0.7, `hsla(${liquidHue}, 25%, 8%, 0.94)`);
      interiorGrad.addColorStop(1, 'rgba(15, 12, 8, 0.96)');
      ctx.fillStyle = interiorGrad;
      ctx.fillRect(centerX - lampWidth, glassTop, lampWidth * 2, glassHeight);

      // Vertical liquid tint
      const vertLiquid = ctx.createLinearGradient(0, glassTop, 0, glassBottom);
      vertLiquid.addColorStop(0, 'rgba(0, 0, 0, 0.1)');
      vertLiquid.addColorStop(0.3, `hsla(${liquidHue}, 15%, 15%, 0.08)`);
      vertLiquid.addColorStop(0.7, `hsla(${liquidHue}, 20%, 12%, 0.1)`);
      vertLiquid.addColorStop(1, `hsla(${waxHueBase}, 30%, 20%, 0.15)`);
      ctx.fillStyle = vertLiquid;
      ctx.fillRect(centerX - lampWidth, glassTop, lampWidth * 2, glassHeight);
    };

    // Draw glass overlay with enhanced reflections
    const drawGlassOverlay = (breath, elapsed) => {
      ctx.restore();

      // Glass edge highlight
      ctx.beginPath();
      ctx.moveTo(centerX - bottleNeckWidth * 0.36, bottleNeckTop);
      ctx.quadraticCurveTo(
        centerX - bottleNeckWidth * 0.40, bottleBulgeStart,
        centerX - bottleBulgeWidth * 0.44, bottleBulgeStart + glassHeight * 0.12
      );
      ctx.quadraticCurveTo(
        centerX - bottleBulgeWidth * 0.48, glassTop + glassHeight * 0.5,
        centerX - bottleBottomWidth * 0.40, glassBottom - glassHeight * 0.05
      );
      ctx.quadraticCurveTo(
        centerX, glassBottom + 3,
        centerX + bottleBottomWidth * 0.40, glassBottom - glassHeight * 0.05
      );
      ctx.quadraticCurveTo(
        centerX + bottleBulgeWidth * 0.48, glassTop + glassHeight * 0.5,
        centerX + bottleBulgeWidth * 0.44, bottleBulgeStart + glassHeight * 0.12
      );
      ctx.quadraticCurveTo(
        centerX + bottleNeckWidth * 0.40, bottleBulgeStart,
        centerX + bottleNeckWidth * 0.36, bottleNeckTop
      );

      // Warm tinted glass edge
      ctx.strokeStyle = `hsla(${liquidHue}, 30%, 55%, ${0.22 + breath * 0.08})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Left side main reflection
      ctx.beginPath();
      ctx.moveTo(centerX - bottleNeckWidth * 0.30, bottleNeckTop + 12);
      ctx.quadraticCurveTo(
        centerX - bottleBulgeWidth * 0.38, glassTop + glassHeight * 0.38,
        centerX - bottleBottomWidth * 0.33, glassBottom - glassHeight * 0.15
      );
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.08 + breath * 0.03})`;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Secondary reflection (thinner)
      ctx.beginPath();
      ctx.moveTo(centerX - bottleNeckWidth * 0.24, bottleNeckTop + 25);
      ctx.quadraticCurveTo(
        centerX - bottleBulgeWidth * 0.32, glassTop + glassHeight * 0.4,
        centerX - bottleBottomWidth * 0.28, glassBottom - glassHeight * 0.18
      );
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.04 + breath * 0.02})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Specular highlights (small bright spots)
      const specY = glassTop + glassHeight * 0.28 + Math.sin(elapsed * 0.0008) * 5;
      ctx.beginPath();
      ctx.ellipse(centerX - bottleBulgeWidth * 0.26, specY, 2.5, 10, -0.12, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.18 + breath * 0.06})`;
      ctx.fill();

      // Second specular
      ctx.beginPath();
      ctx.ellipse(centerX - bottleBulgeWidth * 0.22, specY + 35, 1.5, 6, -0.1, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.10 + breath * 0.04})`;
      ctx.fill();

      // Right side subtle reflection
      ctx.beginPath();
      ctx.moveTo(centerX + bottleNeckWidth * 0.28, bottleNeckTop + 20);
      ctx.quadraticCurveTo(
        centerX + bottleBulgeWidth * 0.35, glassTop + glassHeight * 0.35,
        centerX + bottleBottomWidth * 0.30, glassBottom - glassHeight * 0.20
      );
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.03 + breath * 0.015})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Glass thickness edge effect
      ctx.beginPath();
      ctx.moveTo(centerX - bottleNeckWidth * 0.36, bottleNeckTop);
      ctx.quadraticCurveTo(
        centerX - bottleBulgeWidth * 0.44, glassTop + glassHeight * 0.3,
        centerX - bottleBottomWidth * 0.40, glassBottom - glassHeight * 0.05
      );
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    };

    // Draw background
    const drawBackground = (breath) => {
      // Deep dark background
      ctx.fillStyle = '#050508';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Ambient glow from lamp
      const ambientGlow = ctx.createRadialGradient(
        centerX, lampTop + lampHeight * 0.45, lampWidth * 0.3,
        centerX, lampTop + lampHeight * 0.45, lampWidth * 4
      );
      ambientGlow.addColorStop(0, `hsla(${waxHueBase}, 60%, 40%, ${0.20 + breath * 0.10})`);
      ambientGlow.addColorStop(0.3, `hsla(${waxHueBase + 5}, 50%, 30%, ${0.10 + breath * 0.05})`);
      ambientGlow.addColorStop(0.6, `hsla(${waxHueBase}, 40%, 20%, ${0.04 + breath * 0.02})`);
      ambientGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = ambientGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle vignette
      const vignette = ctx.createRadialGradient(
        centerX, canvas.height / 2, 0,
        centerX, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.7
      );
      vignette.addColorStop(0, 'transparent');
      vignette.addColorStop(0.7, 'transparent');
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    // Blob spawning
    let lastSpawnTime = 0;
    const spawnBlob = (elapsed) => {
      if (elapsed - lastSpawnTime > 10 && blobs.length < 12 && Math.random() < 0.008) {
        const x = centerX + (Math.random() - 0.5) * lampWidth * 0.35;
        const y = glassBottom - 22;
        blobs.push(new WaxBlob(x, y, 14 + Math.random() * 18, true));
        lastSpawnTime = elapsed;
      }

      // Remove cold, settled blobs
      for (let i = blobs.length - 1; i >= 0; i--) {
        const blob = blobs[i];
        if (blob.y > glassBottom - 35 && blob.temperature < 0.25 && blob.age > 18000 && blobs.length > 5) {
          blobs.splice(i, 1);
        }
      }
    };

    let lastTime = Date.now();

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const now = Date.now();
      const dt = Math.min(now - lastTime, 50);
      lastTime = now;

      const elapsed = (now - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      // Draw scene layers
      drawBackground(breath);
      drawChromeBase(breath);
      drawGlassBottle();
      drawHeatShimmer(elapsed);
      drawCaustics(elapsed, breath);

      // Touch interaction
      touchPointsRef.current.forEach(point => {
        if (point.active) {
          blobs.forEach(blob => {
            const dx = blob.x - point.x;
            const dy = blob.y - point.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 90 && dist > 1) {
              const force = (1 - dist / 90) * 0.7;
              blob.vx += (dx / dist) * force * 0.25;
              blob.vy += (dy / dist) * force * 0.25;
              blob.temperature = Math.min(1, blob.temperature + 0.018);
            }
          });
        }
      });

      // Update physics
      blobs.forEach(blob => blob.update(dt, elapsed));
      spawnBlob(elapsed);

      // Draw wax elements
      drawWaxPool(elapsed, breath);
      drawOrganicBlobs(elapsed, breath);

      // Finish with glass overlay and cap
      drawGlassOverlay(breath, elapsed);
      drawChromeCap(breath);
      drawRipples(ctx);
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
  }, [currentMode, getBreathPhase, drawRipples, hue]);

  // ========== AURORA MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'aurora' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    // Aurora band class
    class AuroraBand {
      constructor(index, total) {
        this.baseY = canvas.height * 0.2 + (index / total) * canvas.height * 0.35;
        this.amplitude = 20 + Math.random() * 40;
        this.frequency = 0.003 + Math.random() * 0.003;
        this.speed = 0.0003 + Math.random() * 0.0003;
        this.phase = Math.random() * Math.PI * 2;
        this.height = 60 + Math.random() * 80;
        // Use teal hue with variations
        this.hue = hue + (Math.random() - 0.5) * 25;
        this.alpha = 0.15 + Math.random() * 0.1;
      }

      draw(ctx, time, breath) {
        const segments = 60;
        const segmentWidth = canvas.width / segments;

        ctx.beginPath();
        ctx.moveTo(0, canvas.height);

        // Bottom edge
        for (let i = 0; i <= segments; i++) {
          const x = i * segmentWidth;
          const wave1 = Math.sin(x * this.frequency + time * this.speed + this.phase) * this.amplitude;
          const wave2 = Math.sin(x * this.frequency * 0.5 + time * this.speed * 0.7) * this.amplitude * 0.5;
          const y = this.baseY + wave1 + wave2 + (1 - breath) * 30;
          ctx.lineTo(x, y + this.height * (0.8 + breath * 0.4));
        }

        // Top edge (going back)
        for (let i = segments; i >= 0; i--) {
          const x = i * segmentWidth;
          const wave1 = Math.sin(x * this.frequency + time * this.speed + this.phase) * this.amplitude;
          const wave2 = Math.sin(x * this.frequency * 0.5 + time * this.speed * 0.7) * this.amplitude * 0.5;
          const y = this.baseY + wave1 + wave2 + (1 - breath) * 30;
          ctx.lineTo(x, y);
        }

        ctx.closePath();

        // Gradient fill
        const gradY = this.baseY - this.amplitude;
        const gradient = ctx.createLinearGradient(0, gradY, 0, gradY + this.height + this.amplitude * 2);
        gradient.addColorStop(0, `hsla(${this.hue}, 80%, 60%, ${this.alpha * breath * 0.5})`);
        gradient.addColorStop(0.3, `hsla(${this.hue}, 75%, 50%, ${this.alpha * (0.5 + breath * 0.5)})`);
        gradient.addColorStop(0.7, `hsla(${this.hue + 10}, 70%, 45%, ${this.alpha * (0.3 + breath * 0.4)})`);
        gradient.addColorStop(1, `hsla(${this.hue + 20}, 65%, 35%, 0)`);

        ctx.fillStyle = gradient;
        ctx.fill();
      }
    }

    // Shimmer particles
    class ShimmerParticle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height * 0.15 + Math.random() * canvas.height * 0.45;
        this.size = 1 + Math.random() * 2;
        this.alpha = 0;
        this.maxAlpha = 0.3 + Math.random() * 0.4;
        this.fadeIn = true;
        this.fadeSpeed = 0.01 + Math.random() * 0.02;
      }

      update() {
        if (this.fadeIn) {
          this.alpha += this.fadeSpeed;
          if (this.alpha >= this.maxAlpha) this.fadeIn = false;
        } else {
          this.alpha -= this.fadeSpeed * 0.5;
          if (this.alpha <= 0) this.reset();
        }
      }

      draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 70%, 85%, ${this.alpha})`;
        ctx.fill();
      }
    }

    // Stars in background
    const stars = [];
    for (let i = 0; i < 150; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5,
        brightness: Math.random() * 0.5 + 0.2,
        twinkleSpeed: Math.random() * 0.003 + 0.001,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Initialize aurora bands
    const bands = [];
    for (let i = 0; i < 5; i++) {
      bands.push(new AuroraBand(i, 5));
    }

    // Shimmer particles
    const shimmers = [];
    for (let i = 0; i < 40; i++) {
      shimmers.push(new ShimmerParticle());
    }

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      // Night sky gradient
      const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGradient.addColorStop(0, '#020208');
      skyGradient.addColorStop(0.3, '#050510');
      skyGradient.addColorStop(0.6, '#080815');
      skyGradient.addColorStop(1, '#0a0a18');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      stars.forEach(star => {
        const twinkle = 0.5 + Math.sin(now * star.twinkleSpeed + star.phase) * 0.5;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * star.brightness})`;
        ctx.fill();
      });

      // Touch interactions - spawn shimmers and create disturbance
      touchPointsRef.current.forEach(point => {
        if (point.active) {
          // Spawn shimmer at touch
          if (Math.random() < 0.3) {
            const shimmer = new ShimmerParticle();
            shimmer.x = point.x + (Math.random() - 0.5) * 60;
            shimmer.y = point.y + (Math.random() - 0.5) * 60;
            shimmer.alpha = 0.5;
            shimmer.maxAlpha = 0.7;
            shimmers.push(shimmer);
          }
          // Draw touch glow
          const touchGlow = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, 100);
          touchGlow.addColorStop(0, `hsla(${hue}, 52%, 68%, 0.3)`);
          touchGlow.addColorStop(0.5, `hsla(${hue}, 52%, 68%, 0.1)`);
          touchGlow.addColorStop(1, 'transparent');
          ctx.fillStyle = touchGlow;
          ctx.beginPath();
          ctx.arc(point.x, point.y, 100, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Limit shimmers
      if (shimmers.length > 80) shimmers.splice(0, shimmers.length - 80);

      // Draw aurora bands with blending
      ctx.globalCompositeOperation = 'screen';
      bands.forEach(band => band.draw(ctx, now, breath));
      ctx.globalCompositeOperation = 'source-over';

      // Draw shimmers
      shimmers.forEach(shimmer => {
        shimmer.update();
        shimmer.draw(ctx);
      });

      // Silhouette mountains
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      for (let x = 0; x <= canvas.width; x += 20) {
        const peak1 = Math.sin(x * 0.005) * 80;
        const peak2 = Math.sin(x * 0.012 + 1) * 40;
        const peak3 = Math.sin(x * 0.003 + 2) * 60;
        const y = canvas.height - 80 - peak1 - peak2 - peak3;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fillStyle = '#03030a';
      ctx.fill();

      // Snow-covered peaks
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      for (let x = 0; x <= canvas.width; x += 20) {
        const peak1 = Math.sin(x * 0.005) * 80;
        const peak2 = Math.sin(x * 0.012 + 1) * 40;
        const peak3 = Math.sin(x * 0.003 + 2) * 60;
        const baseY = canvas.height - 80 - peak1 - peak2 - peak3;
        const snowHeight = 8 + Math.sin(x * 0.05) * 4;
        ctx.lineTo(x, baseY + snowHeight);
      }
      ctx.lineTo(canvas.width, canvas.height - 60);
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fillStyle = '#04040c';
      ctx.fill();

      drawRipples(ctx);
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
  }, [currentMode, drawRipples]);

  // ========== SNOW MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'snow' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    // Snowflake class
    class Snowflake {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = Math.random() * canvas.width;
        this.y = initial ? Math.random() * canvas.height : -10;
        this.z = Math.random(); // Depth: 0 = far, 1 = close
        this.size = 2 + this.z * 4;
        this.speed = 0.3 + this.z * 0.7;
        this.wobblePhase = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.02 + Math.random() * 0.02;
        this.wobbleAmount = 0.3 + Math.random() * 0.5;
        this.alpha = 0.4 + this.z * 0.5;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
      }

      update(dt, breath) {
        const speedMod = 0.5 + breath * 0.5;
        this.y += this.speed * speedMod * dt * 0.05;
        this.wobblePhase += this.wobbleSpeed;
        this.x += Math.sin(this.wobblePhase) * this.wobbleAmount;
        this.rotation += this.rotationSpeed;

        // Wind effect
        this.x += (0.2 + breath * 0.1) * this.z * dt * 0.01;

        if (this.y > canvas.height + 20 || this.x > canvas.width + 50) {
          this.reset();
        }
      }

      draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        if (this.z > 0.5) {
          // Detailed snowflake for close ones
          ctx.strokeStyle = `rgba(255, 255, 255, ${this.alpha})`;
          ctx.lineWidth = 1;
          for (let i = 0; i < 6; i++) {
            ctx.save();
            ctx.rotate((i / 6) * Math.PI * 2);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -this.size);
            // Branches
            ctx.moveTo(0, -this.size * 0.4);
            ctx.lineTo(-this.size * 0.3, -this.size * 0.6);
            ctx.moveTo(0, -this.size * 0.4);
            ctx.lineTo(this.size * 0.3, -this.size * 0.6);
            ctx.stroke();
            ctx.restore();
          }
        } else {
          // Simple circle for distant ones
          ctx.beginPath();
          ctx.arc(0, 0, this.size * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha * 0.7})`;
          ctx.fill();
        }

        ctx.restore();
      }
    }

    // Initialize snowflakes
    const snowflakeCount = Math.min(200, Math.floor((canvas.width * canvas.height) / 5000));
    const snowflakes = [];
    for (let i = 0; i < snowflakeCount; i++) {
      snowflakes.push(new Snowflake());
    }

    // Ground snow accumulation points
    const groundSnow = [];
    for (let x = 0; x <= canvas.width; x += 8) {
      groundSnow.push({
        x,
        height: 20 + Math.random() * 15 + Math.sin(x * 0.02) * 10,
      });
    }

    // Pine trees
    const trees = [];
    const treeCount = Math.floor(canvas.width / 120);
    for (let i = 0; i < treeCount; i++) {
      trees.push({
        x: (i / treeCount) * canvas.width + Math.random() * 60 - 30,
        height: 80 + Math.random() * 60,
        width: 30 + Math.random() * 20,
        snowAmount: 0.3 + Math.random() * 0.3,
      });
    }

    const drawTree = (tree) => {
      const { x, height, width, snowAmount } = tree;
      const baseY = canvas.height - 30;
      const layers = 4;

      for (let i = 0; i < layers; i++) {
        const layerY = baseY - (i / layers) * height;
        const layerWidth = width * (1 - i / (layers + 1));
        const layerHeight = height / layers + 10;

        // Tree layer
        ctx.beginPath();
        ctx.moveTo(x, layerY - layerHeight);
        ctx.lineTo(x - layerWidth, layerY);
        ctx.lineTo(x + layerWidth, layerY);
        ctx.closePath();
        ctx.fillStyle = '#1a2a25';
        ctx.fill();

        // Snow on tree
        ctx.beginPath();
        ctx.moveTo(x, layerY - layerHeight);
        ctx.lineTo(x - layerWidth * 0.7, layerY - layerHeight * 0.3);
        ctx.lineTo(x + layerWidth * 0.7, layerY - layerHeight * 0.3);
        ctx.closePath();
        ctx.fillStyle = `rgba(240, 245, 255, ${snowAmount})`;
        ctx.fill();
      }

      // Trunk
      ctx.fillStyle = '#2a1a15';
      ctx.fillRect(x - 5, baseY - 10, 10, 25);
    };

    let lastTime = Date.now();

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const now = Date.now();
      const dt = Math.min(now - lastTime, 50);
      lastTime = now;

      const elapsed = (now - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      // Winter sky gradient
      const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGradient.addColorStop(0, '#1a2535');
      skyGradient.addColorStop(0.4, '#2a3545');
      skyGradient.addColorStop(0.7, '#3a4555');
      skyGradient.addColorStop(1, '#4a5565');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Distant mountains
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      for (let x = 0; x <= canvas.width; x += 30) {
        const y = canvas.height - 150 - Math.sin(x * 0.003) * 80 - Math.sin(x * 0.007) * 40;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fillStyle = '#3a4555';
      ctx.fill();

      // Snow on mountains
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 150);
      for (let x = 0; x <= canvas.width; x += 30) {
        const baseY = canvas.height - 150 - Math.sin(x * 0.003) * 80 - Math.sin(x * 0.007) * 40;
        ctx.lineTo(x, baseY + 15);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fillStyle = 'rgba(200, 210, 230, 0.3)';
      ctx.fill();

      // Draw trees
      trees.forEach(tree => drawTree(tree));

      // Ground snow
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      groundSnow.forEach(point => {
        ctx.lineTo(point.x, canvas.height - point.height - breath * 5);
      });
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();

      const snowGradient = ctx.createLinearGradient(0, canvas.height - 50, 0, canvas.height);
      snowGradient.addColorStop(0, '#e8f0f8');
      snowGradient.addColorStop(0.5, '#d8e4f0');
      snowGradient.addColorStop(1, '#c8d8e8');
      ctx.fillStyle = snowGradient;
      ctx.fill();

      // Touch interactions - blow snowflakes away
      touchPointsRef.current.forEach(point => {
        if (point.active) {
          snowflakes.forEach(flake => {
            const dx = flake.x - point.x;
            const dy = flake.y - point.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120 && dist > 1) {
              const force = (1 - dist / 120) * 2 * flake.z;
              flake.x += (dx / dist) * force;
              flake.y += (dy / dist) * force * 0.5;
            }
          });
          // Draw wind swirl
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = 1;
          for (let i = 0; i < 5; i++) {
            const angle = (Date.now() * 0.002) + (i * Math.PI * 2 / 5);
            ctx.beginPath();
            ctx.arc(point.x, point.y, 20 + i * 12, angle, angle + Math.PI * 0.4);
            ctx.stroke();
          }
        }
      });

      // Update and draw snowflakes (sorted by depth)
      snowflakes.sort((a, b) => a.z - b.z);
      snowflakes.forEach(flake => {
        flake.update(dt, breath);
        flake.draw(ctx);
      });

      drawRipples(ctx);
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
  }, [currentMode, drawRipples]);

  // ========== LOTUS MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'lotus' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw a single petal
    const drawPetal = (ctx, x, y, width, height, angle, openness, color, shadowColor) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      // Apply opening transform
      ctx.scale(1, 0.3 + openness * 0.7);

      // Petal shape
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(
        -width * 0.5, -height * 0.3,
        -width * 0.3, -height,
        0, -height
      );
      ctx.bezierCurveTo(
        width * 0.3, -height,
        width * 0.5, -height * 0.3,
        0, 0
      );

      // Gradient fill
      const gradient = ctx.createLinearGradient(0, 0, 0, -height);
      gradient.addColorStop(0, shadowColor);
      gradient.addColorStop(0.4, color);
      gradient.addColorStop(0.8, color);
      gradient.addColorStop(1, `rgba(255, 255, 255, 0.3)`);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Subtle vein line
      ctx.strokeStyle = `rgba(255, 255, 255, 0.15)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -height * 0.1);
      ctx.lineTo(0, -height * 0.85);
      ctx.stroke();

      ctx.restore();
    };

    // Water ripple class
    class WaterRipple {
      constructor() {
        this.x = centerX + (Math.random() - 0.5) * canvas.width * 0.8;
        this.y = centerY + (Math.random() - 0.5) * canvas.height * 0.4 + canvas.height * 0.15;
        this.radius = 0;
        this.maxRadius = 30 + Math.random() * 50;
        this.speed = 0.3 + Math.random() * 0.2;
        this.alpha = 0.3;
      }

      update() {
        this.radius += this.speed;
        this.alpha = 0.3 * (1 - this.radius / this.maxRadius);
        return this.radius < this.maxRadius;
      }

      draw(ctx) {
        ctx.strokeStyle = `hsla(${hue}, 52%, 68%, ${this.alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.radius, this.radius * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    const ripples = [];

    // Lily pads
    const lilyPads = [];
    for (let i = 0; i < 5; i++) {
      lilyPads.push({
        x: centerX + (Math.random() - 0.5) * canvas.width * 0.7,
        y: centerY + Math.random() * canvas.height * 0.3 + canvas.height * 0.1,
        radius: 30 + Math.random() * 25,
        rotation: Math.random() * Math.PI * 2,
        notchAngle: Math.random() * Math.PI * 2,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const drawLilyPad = (pad, time) => {
      const wobble = Math.sin(time * 0.001 + pad.phase) * 0.02;

      ctx.save();
      ctx.translate(pad.x, pad.y);
      ctx.rotate(pad.rotation + wobble);
      ctx.scale(1, 0.4);

      // Main pad
      ctx.beginPath();
      ctx.arc(0, 0, pad.radius, pad.notchAngle + 0.2, pad.notchAngle + Math.PI * 2 - 0.2);
      ctx.lineTo(0, 0);
      ctx.closePath();

      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, pad.radius);
      gradient.addColorStop(0, `hsla(${hue}, 30%, 30%, 0.8)`);
      gradient.addColorStop(0.7, `hsla(${hue}, 28%, 22%, 0.7)`);
      gradient.addColorStop(1, `hsla(${hue}, 25%, 15%, 0.6)`);
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.restore();
    };

    let lastTime = Date.now();

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const now = Date.now();
      const dt = Math.min(now - lastTime, 50);
      lastTime = now;

      const elapsed = (now - startTime) / 1000;
      const breath = getBreathPhase(elapsed);
      const openness = breath; // Lotus opens with inhale

      // Dark water background
      const waterGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, Math.max(canvas.width, canvas.height) * 0.7
      );
      waterGradient.addColorStop(0, '#0a1520');
      waterGradient.addColorStop(0.5, '#081218');
      waterGradient.addColorStop(1, '#050a0f');
      ctx.fillStyle = waterGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add occasional ripples
      if (Math.random() < 0.02) {
        ripples.push(new WaterRipple());
      }

      // Touch interactions - spawn ripples at touch points
      touchPointsRef.current.forEach(point => {
        if (point.active && Math.random() < 0.15) {
          const ripple = new WaterRipple();
          ripple.x = point.x + (Math.random() - 0.5) * 30;
          ripple.y = point.y + (Math.random() - 0.5) * 30;
          ripple.maxRadius = 60 + Math.random() * 40;
          ripples.push(ripple);
        }
      });

      // Limit ripples
      if (ripples.length > 30) ripples.splice(0, ripples.length - 30);

      // Update and draw ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        if (!ripples[i].update()) {
          ripples.splice(i, 1);
        } else {
          ripples[i].draw(ctx);
        }
      }

      // Draw lily pads
      lilyPads.forEach(pad => drawLilyPad(pad, now));

      // Lotus center position (slightly bobbing)
      const lotusY = centerY + Math.sin(now * 0.0008) * 8;
      const lotusScale = Math.min(canvas.width, canvas.height) * 0.0015;

      // Draw outer petals (3 layers) - using teal color scheme
      const petalLayers = [
        { count: 12, radius: 110 * lotusScale, size: { w: 35, h: 90 }, color: `hsla(${hue}, 45%, 72%, 0.9)`, shadow: `hsla(${hue - 10}, 50%, 50%, 0.8)` },
        { count: 10, radius: 80 * lotusScale, size: { w: 30, h: 75 }, color: `hsla(${hue}, 48%, 76%, 0.9)`, shadow: `hsla(${hue - 10}, 45%, 55%, 0.8)` },
        { count: 8, radius: 50 * lotusScale, size: { w: 25, h: 60 }, color: `hsla(${hue}, 50%, 82%, 0.95)`, shadow: `hsla(${hue - 10}, 40%, 60%, 0.85)` },
      ];

      petalLayers.forEach((layer, layerIndex) => {
        const layerOpenness = Math.max(0, Math.min(1, openness * 1.5 - layerIndex * 0.2));

        for (let i = 0; i < layer.count; i++) {
          const angle = (i / layer.count) * Math.PI * 2 - Math.PI / 2;
          const petalAngle = angle + Math.PI; // Point outward
          const petalDist = layer.radius * (0.3 + layerOpenness * 0.7);
          const px = centerX + Math.cos(angle) * petalDist;
          const py = lotusY + Math.sin(angle) * petalDist * 0.4;

          drawPetal(
            ctx,
            px, py,
            layer.size.w * lotusScale,
            layer.size.h * lotusScale * (0.7 + layerOpenness * 0.3),
            petalAngle - Math.PI / 2 + (1 - layerOpenness) * (angle > 0 ? 0.3 : -0.3),
            layerOpenness,
            layer.color,
            layer.shadow
          );
        }
      });

      // Center pistil/stamen
      const centerSize = 25 * lotusScale;
      const centerGradient = ctx.createRadialGradient(centerX, lotusY, 0, centerX, lotusY, centerSize);
      centerGradient.addColorStop(0, 'rgba(255, 220, 100, 0.95)');
      centerGradient.addColorStop(0.6, 'rgba(240, 180, 60, 0.9)');
      centerGradient.addColorStop(1, 'rgba(200, 140, 40, 0.8)');
      ctx.beginPath();
      ctx.arc(centerX, lotusY, centerSize, 0, Math.PI * 2);
      ctx.fillStyle = centerGradient;
      ctx.fill();

      // Stamen dots
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const dist = centerSize * 0.6;
        const sx = centerX + Math.cos(angle) * dist;
        const sy = lotusY + Math.sin(angle) * dist * 0.5;
        ctx.beginPath();
        ctx.arc(sx, sy, 2 * lotusScale, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(180, 120, 40, 0.8)';
        ctx.fill();
      }

      // Glow around lotus
      const glowGradient = ctx.createRadialGradient(centerX, lotusY, 0, centerX, lotusY, 200 * lotusScale);
      glowGradient.addColorStop(0, `rgba(255, 200, 210, ${0.1 + breath * 0.1})`);
      glowGradient.addColorStop(0.5, `rgba(255, 180, 190, ${0.05 + breath * 0.05})`);
      glowGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(centerX, lotusY, 200 * lotusScale, 0, Math.PI * 2);
      ctx.fill();

      drawRipples(ctx);
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
  }, [currentMode, drawRipples]);

  // ========== CANDLE MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'candle' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    const centerX = canvas.width / 2;
    const candleBottom = canvas.height * 0.75;

    // Flame particle class
    class FlameParticle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = centerX + (Math.random() - 0.5) * 10;
        this.y = candleBottom - 120;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = -1 - Math.random() * 2;
        this.life = 1;
        this.decay = 0.02 + Math.random() * 0.02;
        this.size = 3 + Math.random() * 4;
      }

      update(breath, isInhaling) {
        // Wind effect from breath
        const wind = isInhaling ? -0.05 : 0.05;
        this.vx += wind * breath;

        this.x += this.vx;
        this.y += this.vy;
        this.vy *= 0.98;
        this.life -= this.decay;

        if (this.life <= 0) this.reset();
      }

      draw(ctx) {
        const alpha = this.life * 0.6;
        const hue = 30 + (1 - this.life) * 20; // Orange to yellow

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 100%, ${50 + this.life * 30}%, ${alpha})`;
        ctx.fill();
      }
    }

    // Initialize flame particles
    const particles = [];
    for (let i = 0; i < 30; i++) {
      particles.push(new FlameParticle());
    }

    // Smoke particles
    class SmokeParticle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = centerX + (Math.random() - 0.5) * 8;
        this.y = candleBottom - 180;
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = -0.3 - Math.random() * 0.3;
        this.life = 1;
        this.decay = 0.008 + Math.random() * 0.005;
        this.size = 5 + Math.random() * 8;
      }

      update() {
        this.x += this.vx + Math.sin(this.y * 0.01) * 0.3;
        this.y += this.vy;
        this.size += 0.1;
        this.life -= this.decay;

        if (this.life <= 0) this.reset();
      }

      draw(ctx) {
        const alpha = this.life * 0.15;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 200, 200, ${alpha})`;
        ctx.fill();
      }
    }

    const smokeParticles = [];
    for (let i = 0; i < 15; i++) {
      smokeParticles.push(new SmokeParticle());
    }

    // Draw candle body
    const drawCandle = (breath) => {
      const candleWidth = 50;
      const candleHeight = 150;
      const candleTop = candleBottom - candleHeight;

      // Candle body gradient
      const bodyGradient = ctx.createLinearGradient(
        centerX - candleWidth / 2, 0,
        centerX + candleWidth / 2, 0
      );
      bodyGradient.addColorStop(0, '#f5e6d3');
      bodyGradient.addColorStop(0.3, '#fff8f0');
      bodyGradient.addColorStop(0.7, '#fff8f0');
      bodyGradient.addColorStop(1, '#e8d9c6');

      // Main body
      ctx.fillStyle = bodyGradient;
      ctx.beginPath();
      ctx.roundRect(
        centerX - candleWidth / 2,
        candleTop,
        candleWidth,
        candleHeight,
        [5, 5, 0, 0]
      );
      ctx.fill();

      // Wax drips
      const drips = [
        { x: -20, height: 25 },
        { x: -10, height: 40 },
        { x: 15, height: 30 },
        { x: 22, height: 20 },
      ];

      drips.forEach(drip => {
        ctx.fillStyle = '#f5e6d3';
        ctx.beginPath();
        ctx.ellipse(
          centerX + drip.x,
          candleTop + drip.height,
          6,
          drip.height,
          0, 0, Math.PI * 2
        );
        ctx.fill();
      });

      // Wick
      ctx.strokeStyle = '#2a2a2a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX, candleTop);
      ctx.lineTo(centerX, candleTop - 20);
      ctx.stroke();

      // Melted pool at top
      ctx.fillStyle = 'rgba(255, 200, 150, 0.6)';
      ctx.beginPath();
      ctx.ellipse(centerX, candleTop + 5, candleWidth / 2 - 5, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    // Draw flame
    const drawFlame = (breath, isInhaling, time) => {
      const flameX = centerX;
      const flameY = candleBottom - 150;
      const flameHeight = 60 + breath * 20;
      const flameWidth = 20 + breath * 8;

      // Flame wobble
      const wobble = Math.sin(time * 0.005) * 3 + (isInhaling ? -5 : 5) * breath;

      // Outer glow
      const glowGradient = ctx.createRadialGradient(
        flameX + wobble * 0.5, flameY - flameHeight * 0.3, 0,
        flameX, flameY, flameHeight * 1.5
      );
      glowGradient.addColorStop(0, `rgba(255, 150, 50, ${0.3 + breath * 0.1})`);
      glowGradient.addColorStop(0.5, `rgba(255, 100, 30, ${0.1 + breath * 0.05})`);
      glowGradient.addColorStop(1, 'transparent');

      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(flameX, flameY - flameHeight * 0.3, flameHeight * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Main flame shape
      ctx.save();
      ctx.translate(flameX + wobble, flameY);

      // Outer flame (orange)
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(
        -flameWidth * 0.8, -flameHeight * 0.3,
        -flameWidth * 0.4, -flameHeight * 0.7,
        0, -flameHeight
      );
      ctx.bezierCurveTo(
        flameWidth * 0.4, -flameHeight * 0.7,
        flameWidth * 0.8, -flameHeight * 0.3,
        0, 0
      );

      const outerGradient = ctx.createLinearGradient(0, 0, 0, -flameHeight);
      outerGradient.addColorStop(0, 'rgba(255, 100, 20, 0.9)');
      outerGradient.addColorStop(0.3, 'rgba(255, 150, 50, 0.85)');
      outerGradient.addColorStop(0.6, 'rgba(255, 200, 80, 0.8)');
      outerGradient.addColorStop(1, 'rgba(255, 230, 150, 0.3)');
      ctx.fillStyle = outerGradient;
      ctx.fill();

      // Inner flame (yellow-white)
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(
        -flameWidth * 0.3, -flameHeight * 0.2,
        -flameWidth * 0.2, -flameHeight * 0.5,
        0, -flameHeight * 0.7
      );
      ctx.bezierCurveTo(
        flameWidth * 0.2, -flameHeight * 0.5,
        flameWidth * 0.3, -flameHeight * 0.2,
        0, 0
      );

      const innerGradient = ctx.createLinearGradient(0, 0, 0, -flameHeight * 0.7);
      innerGradient.addColorStop(0, 'rgba(100, 150, 255, 0.9)');
      innerGradient.addColorStop(0.3, 'rgba(255, 255, 200, 0.95)');
      innerGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.9)');
      innerGradient.addColorStop(1, 'rgba(255, 255, 200, 0.5)');
      ctx.fillStyle = innerGradient;
      ctx.fill();

      ctx.restore();
    };

    let lastTime = Date.now();

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const now = Date.now();
      const dt = Math.min(now - lastTime, 50);
      lastTime = now;

      const elapsed = (now - startTime) / 1000;
      const breath = getBreathPhase(elapsed);
      const isInhaling = Math.sin(elapsed * BREATH_SPEED) > 0;

      // Dark ambient background
      const bgGradient = ctx.createRadialGradient(
        centerX, candleBottom - 100, 0,
        centerX, candleBottom - 100, Math.max(canvas.width, canvas.height)
      );
      bgGradient.addColorStop(0, `rgba(40, 25, 15, ${0.95 + breath * 0.05})`);
      bgGradient.addColorStop(0.3, '#0a0805');
      bgGradient.addColorStop(1, '#050302');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Light cast on surroundings
      const lightRadius = 250 + breath * 50;
      const lightGradient = ctx.createRadialGradient(
        centerX, candleBottom - 120, 0,
        centerX, candleBottom - 120, lightRadius
      );
      lightGradient.addColorStop(0, `rgba(255, 150, 80, ${0.15 + breath * 0.05})`);
      lightGradient.addColorStop(0.5, `rgba(255, 100, 50, ${0.05 + breath * 0.02})`);
      lightGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = lightGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Touch interactions - disturb flame and spawn sparks
      let touchWindX = 0;
      touchPointsRef.current.forEach(point => {
        if (point.active) {
          const dx = point.x - centerX;
          const dy = point.y - (candleBottom - 150);
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            // Wind effect on flame
            touchWindX += (dx / dist) * (1 - dist / 200) * 15;
            // Spawn extra particles
            if (Math.random() < 0.3) {
              const p = new FlameParticle();
              p.x = centerX + (Math.random() - 0.5) * 20;
              p.y = candleBottom - 130;
              p.vx = dx * 0.02;
              p.vy = -2 - Math.random() * 2;
              particles.push(p);
            }
          }
          // Draw heat shimmer at touch
          ctx.strokeStyle = `rgba(255, 150, 50, ${0.1 * (1 - dist / 200)})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(point.x, point.y, 30, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // Limit particles
      if (particles.length > 60) particles.splice(0, particles.length - 60);

      // Draw smoke
      smokeParticles.forEach(p => {
        p.update();
        p.draw(ctx);
      });

      // Draw candle
      drawCandle(breath);

      // Draw flame particles
      ctx.globalCompositeOperation = 'lighter';
      particles.forEach(p => {
        p.vx += touchWindX * 0.01;
        p.update(breath, isInhaling);
        p.draw(ctx);
      });
      ctx.globalCompositeOperation = 'source-over';

      // Draw main flame (with touch wind effect)
      drawFlame(breath, isInhaling, now + touchWindX * 50);

      drawRipples(ctx);
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
  }, [currentMode, drawRipples]);

  // ========== SMOKE MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'smoke' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    const centerX = canvas.width / 2;
    const centerY = canvas.height * 0.85;

    // Smoke tendril class
    class SmokeTendril {
      constructor(index) {
        this.baseX = centerX + (index - 2) * 30;
        this.reset();
      }

      reset() {
        this.points = [];
        const pointCount = 20;
        for (let i = 0; i < pointCount; i++) {
          this.points.push({
            x: this.baseX,
            y: centerY - i * 15,
            vx: 0,
            age: 0,
          });
        }
        this.hue = hue + (Math.random() - 0.5) * 20;
        this.width = 15 + Math.random() * 10;
        this.phase = Math.random() * Math.PI * 2;
        this.speed = 0.5 + Math.random() * 0.3;
      }

      update(dt, breath, isInhaling, time) {
        // Move points upward
        for (let i = this.points.length - 1; i >= 0; i--) {
          const p = this.points[i];
          p.age += dt * 0.001;

          if (i === 0) {
            // Base point stays at source
            p.x = this.baseX + Math.sin(time * 0.002 + this.phase) * 5;
          } else {
            // Follow previous point with curl
            const prev = this.points[i - 1];
            const curl = Math.sin(time * 0.001 * this.speed + i * 0.3 + this.phase) * (3 + i * 0.5);

            // Breath influence
            const breathPush = isInhaling ? -1 : 1;
            p.vx += breathPush * breath * 0.02;
            p.vx *= 0.95;

            p.x += p.vx + curl * 0.1;
            p.y = prev.y - 12 - breath * 3;

            // Spread as it rises
            const spread = i * 0.8;
            p.x = prev.x + p.vx + Math.sin(time * 0.001 + i * 0.2) * spread * 0.3;
          }
        }

        // Reset if top point is off screen
        if (this.points[this.points.length - 1].y < -50) {
          this.reset();
        }
      }

      draw(ctx, breath) {
        if (this.points.length < 2) return;

        // Draw as a flowing ribbon
        ctx.beginPath();
        ctx.moveTo(this.points[0].x - this.width / 2, this.points[0].y);

        // Left edge
        for (let i = 1; i < this.points.length; i++) {
          const p = this.points[i];
          const width = this.width * (1 - i / this.points.length) * (0.8 + breath * 0.2);
          ctx.lineTo(p.x - width / 2, p.y);
        }

        // Right edge (reverse)
        for (let i = this.points.length - 1; i >= 0; i--) {
          const p = this.points[i];
          const width = this.width * (1 - i / this.points.length) * (0.8 + breath * 0.2);
          ctx.lineTo(p.x + width / 2, p.y);
        }

        ctx.closePath();

        // Gradient fill
        const gradient = ctx.createLinearGradient(0, centerY, 0, this.points[this.points.length - 1].y);
        gradient.addColorStop(0, `hsla(${this.hue}, 30%, 60%, 0.4)`);
        gradient.addColorStop(0.3, `hsla(${this.hue}, 25%, 55%, 0.25)`);
        gradient.addColorStop(0.6, `hsla(${this.hue}, 20%, 50%, 0.15)`);
        gradient.addColorStop(1, `hsla(${this.hue}, 15%, 45%, 0)`);

        ctx.fillStyle = gradient;
        ctx.fill();
      }
    }

    // Floating particle class
    class FloatingParticle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = centerX + (Math.random() - 0.5) * 200;
        this.y = centerY;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = -0.5 - Math.random() * 1;
        this.size = 2 + Math.random() * 4;
        this.life = 1;
        this.decay = 0.003 + Math.random() * 0.003;
        this.hue = hue + (Math.random() - 0.5) * 30;
      }

      update(breath) {
        this.x += this.vx + Math.sin(this.y * 0.01) * 0.5;
        this.y += this.vy * (0.5 + breath * 0.5);
        this.life -= this.decay;

        if (this.life <= 0 || this.y < 0) this.reset();
      }

      draw(ctx) {
        const alpha = this.life * 0.5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 40%, 70%, ${alpha})`;
        ctx.fill();
      }
    }

    // Initialize tendrils
    const tendrils = [];
    for (let i = 0; i < 5; i++) {
      tendrils.push(new SmokeTendril(i));
    }

    // Initialize particles
    const particles = [];
    for (let i = 0; i < 50; i++) {
      particles.push(new FloatingParticle());
    }

    // Incense holder
    const drawIncenseHolder = () => {
      // Bowl
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + 10, 40, 15, 0, 0, Math.PI);
      ctx.fillStyle = '#1a1a25';
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(centerX, centerY + 10, 40, 15, 0, Math.PI, Math.PI * 2);
      ctx.fillStyle = '#252530';
      ctx.fill();

      // Incense stick
      ctx.strokeStyle = '#3a3530';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX, centerY - 30);
      ctx.stroke();

      // Glowing tip
      const gradient = ctx.createRadialGradient(centerX, centerY - 30, 0, centerX, centerY - 30, 8);
      gradient.addColorStop(0, 'rgba(255, 150, 100, 0.9)');
      gradient.addColorStop(0.5, 'rgba(255, 100, 50, 0.5)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY - 30, 8, 0, Math.PI * 2);
      ctx.fill();
    };

    let lastTime = Date.now();

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const now = Date.now();
      const dt = Math.min(now - lastTime, 50);
      lastTime = now;

      const elapsed = (now - startTime) / 1000;
      const breath = getBreathPhase(elapsed);
      const isInhaling = Math.sin(elapsed * BREATH_SPEED) > 0;

      // Dark background
      ctx.fillStyle = '#05050c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Ambient glow
      const ambientGlow = ctx.createRadialGradient(
        centerX, centerY - 100, 0,
        centerX, centerY - 100, 300
      );
      ambientGlow.addColorStop(0, `hsla(${hue}, 52%, 68%, ${0.05 + breath * 0.03})`);
      ambientGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = ambientGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Touch interactions - disperse smoke
      touchPointsRef.current.forEach(point => {
        if (point.active) {
          // Push particles away
          particles.forEach(p => {
            const dx = p.x - point.x;
            const dy = p.y - point.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100 && dist > 1) {
              const force = (1 - dist / 100) * 3;
              p.x += (dx / dist) * force;
              p.vx += (dx / dist) * force * 0.1;
            }
          });
          // Push tendril points away
          tendrils.forEach(t => {
            t.points.forEach(p => {
              const dx = p.x - point.x;
              const dy = p.y - point.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 80 && dist > 1) {
                const force = (1 - dist / 80) * 4;
                p.vx += (dx / dist) * force * 0.15;
              }
            });
          });
          // Draw touch swirl
          ctx.strokeStyle = `hsla(${hue}, 52%, 68%, 0.15)`;
          ctx.lineWidth = 1;
          for (let i = 0; i < 3; i++) {
            const angle = (now * 0.002) + (i * Math.PI * 2 / 3);
            ctx.beginPath();
            ctx.arc(point.x, point.y, 25 + i * 15, angle, angle + Math.PI * 0.6);
            ctx.stroke();
          }
        }
      });

      // Update and draw particles (behind tendrils)
      particles.forEach(p => {
        p.update(breath);
        p.draw(ctx);
      });

      // Update and draw tendrils
      ctx.globalCompositeOperation = 'screen';
      tendrils.forEach(t => {
        t.update(dt, breath, isInhaling, now);
        t.draw(ctx, breath);
      });
      ctx.globalCompositeOperation = 'source-over';

      // Draw incense holder
      drawIncenseHolder();

      drawRipples(ctx);
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
  }, [currentMode, drawRipples]);

  // ========== MANDALA MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'mandala' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(canvas.width, canvas.height) * 0.4;

    // Draw a single mandala ring
    const drawRing = (radius, segments, breath, time, ringIndex) => {
      const ringHue = hue + ringIndex * 8;
      const rotation = time * 0.0001 * (ringIndex % 2 === 0 ? 1 : -1);

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);

      // Draw petals/segments
      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const petalLength = radius * (0.15 + breath * 0.05);
        const petalWidth = (Math.PI * 2 / segments) * 0.4;

        ctx.save();
        ctx.rotate(angle);

        // Petal shape
        ctx.beginPath();
        ctx.moveTo(radius - petalLength, 0);

        // Bezier curve for petal
        const cp1x = radius - petalLength * 0.3;
        const cp1y = -petalLength * 0.4 * (0.8 + breath * 0.2);
        const cp2x = radius + petalLength * 0.3;
        const cp2y = -petalLength * 0.3 * (0.8 + breath * 0.2);

        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, radius + petalLength * 0.5, 0);
        ctx.bezierCurveTo(cp2x, -cp2y, cp1x, -cp1y, radius - petalLength, 0);

        // Gradient fill
        const gradient = ctx.createRadialGradient(radius, 0, 0, radius, 0, petalLength);
        gradient.addColorStop(0, `hsla(${ringHue}, 70%, 60%, ${0.6 + breath * 0.2})`);
        gradient.addColorStop(0.5, `hsla(${ringHue + 10}, 65%, 50%, ${0.4 + breath * 0.15})`);
        gradient.addColorStop(1, `hsla(${ringHue + 20}, 60%, 40%, 0.1)`);

        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.restore();
      }

      // Connecting circles at intersections
      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const dotSize = 3 + breath * 2;

        ctx.beginPath();
        ctx.arc(x, y, dotSize, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${ringHue}, 80%, 70%, ${0.5 + breath * 0.3})`;
        ctx.fill();
      }

      ctx.restore();
    };

    // Draw inner lotus pattern
    const drawCenterLotus = (breath, time) => {
      const petalCount = 8;
      const petalLength = maxRadius * 0.15 * (0.9 + breath * 0.2);

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(time * 0.0002);

      for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * 2;

        ctx.save();
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(
          petalLength * 0.3, -petalLength * 0.3,
          petalLength * 0.8, -petalLength * 0.2,
          petalLength, 0
        );
        ctx.bezierCurveTo(
          petalLength * 0.8, petalLength * 0.2,
          petalLength * 0.3, petalLength * 0.3,
          0, 0
        );

        const gradient = ctx.createLinearGradient(0, 0, petalLength, 0);
        gradient.addColorStop(0, `hsla(${hue}, 80%, 70%, ${0.7 + breath * 0.2})`);
        gradient.addColorStop(0.5, `hsla(${hue + 10}, 75%, 60%, ${0.5 + breath * 0.2})`);
        gradient.addColorStop(1, `hsla(${hue + 18}, 70%, 50%, 0.2)`);

        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.restore();
      }

      // Center circle
      const centerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
      centerGradient.addColorStop(0, `hsla(${hue}, 90%, 80%, ${0.8 + breath * 0.2})`);
      centerGradient.addColorStop(0.5, `hsla(${hue}, 85%, 65%, ${0.6 + breath * 0.15})`);
      centerGradient.addColorStop(1, `hsla(${hue}, 80%, 50%, 0.3)`);

      ctx.beginPath();
      ctx.arc(0, 0, 15 + breath * 5, 0, Math.PI * 2);
      ctx.fillStyle = centerGradient;
      ctx.fill();

      ctx.restore();
    };

    // Outer decorative border
    const drawOuterBorder = (breath, time) => {
      const radius = maxRadius + 20;
      const segments = 36;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-time * 0.00005);

      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        // Triangle points outward
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle + Math.PI / 2);

        const size = 8 + breath * 3;
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(-size * 0.6, size * 0.5);
        ctx.lineTo(size * 0.6, size * 0.5);
        ctx.closePath();

        ctx.fillStyle = `hsla(${hue}, 60%, 55%, ${0.3 + breath * 0.2})`;
        ctx.fill();

        ctx.restore();
      }

      ctx.restore();
    };

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      // Dark background
      ctx.fillStyle = '#05050c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Center glow
      const glowGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, maxRadius * 1.3
      );
      glowGradient.addColorStop(0, `hsla(${hue}, 52%, 68%, ${0.1 + breath * 0.05})`);
      glowGradient.addColorStop(0.5, `hsla(${hue}, 45%, 55%, ${0.05 + breath * 0.02})`);
      glowGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Touch interactions - create glowing orbs and affect rotation
      touchPointsRef.current.forEach(point => {
        if (point.active) {
          // Draw touch glow orb
          const touchGlow = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, 80);
          touchGlow.addColorStop(0, `hsla(${hue}, 52%, 68%, 0.4)`);
          touchGlow.addColorStop(0.5, `hsla(${hue}, 52%, 68%, 0.15)`);
          touchGlow.addColorStop(1, 'transparent');
          ctx.fillStyle = touchGlow;
          ctx.beginPath();
          ctx.arc(point.x, point.y, 80, 0, Math.PI * 2);
          ctx.fill();

          // Draw expanding ring
          const ringPhase = (now % 1000) / 1000;
          ctx.strokeStyle = `hsla(${hue}, 52%, 68%, ${0.5 * (1 - ringPhase)})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(point.x, point.y, 20 + ringPhase * 60, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // Draw outer border
      drawOuterBorder(breath, now);

      // Draw rings from outside in
      const rings = [
        { radius: maxRadius, segments: 16 },
        { radius: maxRadius * 0.75, segments: 12 },
        { radius: maxRadius * 0.5, segments: 8 },
        { radius: maxRadius * 0.3, segments: 6 },
      ];

      rings.forEach((ring, index) => {
        drawRing(ring.radius * (0.9 + breath * 0.1), ring.segments, breath, now, index);
      });

      // Draw center lotus
      drawCenterLotus(breath, now);

      drawRipples(ctx);
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
  }, [currentMode, drawRipples]);

  // ========== STARFIELD MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'stars' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Star class - 3D star that moves toward viewer
    class Star {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        // Random position in 3D space
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * Math.max(canvas.width, canvas.height);
        this.x = Math.cos(angle) * radius;
        this.y = Math.sin(angle) * radius;
        this.z = initial ? Math.random() * 1500 + 500 : 2000;
        this.pz = this.z;

        // Star properties
        this.hue = Math.random() < 0.1 ? hue + Math.random() * 30 : 0; // Some teal stars
        this.brightness = 0.5 + Math.random() * 0.5;
      }

      update(speed) {
        this.pz = this.z;
        this.z -= speed;

        if (this.z < 1) {
          this.reset();
        }
      }

      draw(ctx) {
        // Project to 2D
        const sx = centerX + (this.x / this.z) * 400;
        const sy = centerY + (this.y / this.z) * 400;
        const px = centerX + (this.x / this.pz) * 400;
        const py = centerY + (this.y / this.pz) * 400;

        // Check if on screen
        if (sx < 0 || sx > canvas.width || sy < 0 || sy > canvas.height) return;

        // Size based on depth
        const size = Math.max(0.5, (1 - this.z / 2000) * 3);
        const alpha = (1 - this.z / 2000) * this.brightness;

        // Draw trail
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = this.hue > 0
          ? `hsla(${this.hue}, 80%, 70%, ${alpha * 0.5})`
          : `rgba(255, 255, 255, ${alpha * 0.5})`;
        ctx.lineWidth = size * 0.5;
        ctx.stroke();

        // Draw star
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fillStyle = this.hue > 0
          ? `hsla(${this.hue}, 80%, 80%, ${alpha})`
          : `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
      }
    }

    // Nebula class - distant colored clouds
    class Nebula {
      constructor() {
        this.x = (Math.random() - 0.5) * canvas.width * 2;
        this.y = (Math.random() - 0.5) * canvas.height * 2;
        this.radius = 100 + Math.random() * 200;
        this.hue = hue + Math.random() * 60 - 30; // Teal to blue-green
        this.alpha = 0.03 + Math.random() * 0.03;
        this.z = 1500 + Math.random() * 500;
      }

      draw(ctx, centerOffset) {
        const scale = 400 / this.z;
        const sx = centerX + (this.x + centerOffset.x) * scale;
        const sy = centerY + (this.y + centerOffset.y) * scale;
        const r = this.radius * scale;

        const gradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
        gradient.addColorStop(0, `hsla(${this.hue}, 70%, 50%, ${this.alpha})`);
        gradient.addColorStop(0.5, `hsla(${this.hue + 20}, 60%, 40%, ${this.alpha * 0.5})`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Initialize stars
    const starCount = Math.min(400, Math.floor((canvas.width * canvas.height) / 3000));
    const stars = [];
    for (let i = 0; i < starCount; i++) {
      stars.push(new Star());
    }

    // Initialize nebulae
    const nebulae = [];
    for (let i = 0; i < 5; i++) {
      nebulae.push(new Nebula());
    }

    // Background stars (static, distant)
    const backgroundStars = [];
    for (let i = 0; i < 200; i++) {
      backgroundStars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1 + 0.3,
        brightness: Math.random() * 0.4 + 0.1,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.002 + 0.001,
      });
    }

    let lastTime = Date.now();

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const now = Date.now();
      const dt = Math.min(now - lastTime, 50);
      lastTime = now;

      const elapsed = (now - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      // Speed based on breath - faster on inhale
      const isInhaling = Math.sin(elapsed * BREATH_SPEED) > 0;
      const baseSpeed = isInhaling ? 8 : 3;
      const speed = baseSpeed * (0.5 + breath * 0.5) * (dt / 16);

      // Very dark space background
      ctx.fillStyle = '#020204';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw background stars with twinkle
      backgroundStars.forEach(star => {
        const twinkle = 0.5 + Math.sin(now * star.twinkleSpeed + star.twinklePhase) * 0.5;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness * twinkle})`;
        ctx.fill();
      });

      // Draw nebulae
      const nebulaOffset = { x: Math.sin(now * 0.0001) * 50, y: Math.cos(now * 0.00015) * 30 };
      nebulae.forEach(n => n.draw(ctx, nebulaOffset));

      // Update and draw moving stars
      stars.forEach(star => {
        star.update(speed);
        star.draw(ctx);
      });

      // Touch interactions - gravitational pull and spawn burst
      touchPointsRef.current.forEach(point => {
        if (point.active) {
          // Draw gravitational well
          const wellGradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, 100);
          wellGradient.addColorStop(0, `hsla(${hue}, 52%, 68%, 0.3)`);
          wellGradient.addColorStop(0.5, `hsla(${hue}, 52%, 68%, 0.1)`);
          wellGradient.addColorStop(1, 'transparent');
          ctx.fillStyle = wellGradient;
          ctx.beginPath();
          ctx.arc(point.x, point.y, 100, 0, Math.PI * 2);
          ctx.fill();

          // Bend nearby star trails toward touch point
          stars.forEach(star => {
            const sx = centerX + (star.x / star.z) * 400;
            const sy = centerY + (star.y / star.z) * 400;
            const dx = point.x - sx;
            const dy = point.y - sy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150 && dist > 1) {
              const pull = (1 - dist / 150) * 0.5;
              star.x += (dx / dist) * pull * star.z * 0.01;
              star.y += (dy / dist) * pull * star.z * 0.01;
            }
          });

          // Draw swirling effect
          ctx.strokeStyle = `hsla(${hue}, 52%, 68%, 0.2)`;
          ctx.lineWidth = 1;
          for (let i = 0; i < 4; i++) {
            const angle = (now * 0.002) + (i * Math.PI * 0.5);
            const r = 30 + i * 15;
            ctx.beginPath();
            ctx.arc(point.x, point.y, r, angle, angle + Math.PI * 0.4);
            ctx.stroke();
          }
        }
      });

      // Center glow (destination)
      const glowSize = 50 + breath * 30;
      const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowSize);
      glowGradient.addColorStop(0, `hsla(${hue}, 52%, 68%, ${0.2 + breath * 0.1})`);
      glowGradient.addColorStop(0.5, `hsla(${hue}, 45%, 55%, ${0.1 + breath * 0.05})`);
      glowGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, glowSize, 0, Math.PI * 2);
      ctx.fill();

      drawRipples(ctx);
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
  }, [currentMode, drawRipples]);

  // ========== UNDERWATER CAUSTICS MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'caustics' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    // Noise function for caustics
    const noise = (x, y, t) => {
      const s1 = Math.sin(x * 0.02 + t * 0.5) * Math.cos(y * 0.015 + t * 0.3);
      const s2 = Math.sin(x * 0.015 - t * 0.4) * Math.cos(y * 0.02 + t * 0.6);
      const s3 = Math.sin((x + y) * 0.01 + t * 0.2);
      return (s1 + s2 + s3) / 3;
    };

    // Floating debris particles
    const debris = [];
    for (let i = 0; i < 30; i++) {
      debris.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 1 + Math.random() * 3,
        speed: 0.1 + Math.random() * 0.2,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Touch disturbance points
    const disturbances = [];

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      // Sandy floor gradient
      const floorGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      floorGradient.addColorStop(0, '#1a2830');
      floorGradient.addColorStop(0.3, '#2a3840');
      floorGradient.addColorStop(1, '#3d4a4f');
      ctx.fillStyle = floorGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw caustic light pattern
      const cellSize = 8;
      for (let x = 0; x < canvas.width; x += cellSize) {
        for (let y = 0; y < canvas.height; y += cellSize) {
          // Add disturbance influence
          let disturbance = 0;
          disturbances.forEach(d => {
            const dx = x - d.x;
            const dy = y - d.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < d.radius) {
              disturbance += Math.sin(dist * 0.1 - d.age * 5) * (1 - dist / d.radius) * d.strength;
            }
          });

          const n = noise(x + disturbance * 20, y + disturbance * 20, elapsed * 0.8);
          const intensity = (n + 1) * 0.5;

          if (intensity > 0.55) {
            const alpha = (intensity - 0.55) * 2 * (0.3 + breath * 0.15);
            // Steel blue and teal caustics from palette
            const causticHue = hue + (intensity > 0.7 ? 10 : -10); // Teal variations
            ctx.fillStyle = `hsla(${causticHue}, 45%, 55%, ${alpha})`;
            ctx.fillRect(x, y, cellSize + 1, cellSize + 1);
          }
        }
      }

      // Add touch disturbances
      touchPointsRef.current.forEach(point => {
        if (point.active) {
          disturbances.push({
            x: point.x,
            y: point.y,
            radius: 150,
            age: 0,
            strength: 1,
          });
        }
      });

      // Update disturbances
      for (let i = disturbances.length - 1; i >= 0; i--) {
        disturbances[i].age += 0.016;
        disturbances[i].radius += 2;
        disturbances[i].strength *= 0.98;
        if (disturbances[i].strength < 0.01) {
          disturbances.splice(i, 1);
        }
      }

      // Limit disturbances
      if (disturbances.length > 10) disturbances.splice(0, disturbances.length - 10);

      // Draw floating debris
      debris.forEach(d => {
        d.y -= d.speed;
        d.x += Math.sin(elapsed + d.phase) * 0.3;
        if (d.y < -10) {
          d.y = canvas.height + 10;
          d.x = Math.random() * canvas.width;
        }
        ctx.fillStyle = `rgba(180, 190, 170, ${0.3 + breath * 0.1})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Bloom overlay
      ctx.globalCompositeOperation = 'screen';
      const bloomGradient = ctx.createRadialGradient(
        canvas.width / 2, 0, 0,
        canvas.width / 2, 0, canvas.height
      );
      bloomGradient.addColorStop(0, `rgba(74, 144, 164, ${0.1 + breath * 0.05})`);
      bloomGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = bloomGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';

      drawRipples(ctx);
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
  }, [currentMode, drawRipples]);

  // ========== MANDELBROT MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'mandelbrot' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    // Mandelbrot zoom state
    let centerX = -0.745;
    let centerY = 0.186;
    let zoom = 0.005;
    let targetZoom = zoom;
    const maxIterations = 100;

    // Color palette based on app colors
    const getColor = (iter, maxIter) => {
      if (iter === maxIter) return [5, 5, 12];
      const t = iter / maxIter;
      const palette = [
        [123, 104, 238], // purple
        [74, 144, 164],  // steel blue
        [107, 142, 107], // sage
        [212, 165, 116], // sand
        [224, 123, 83],  // orange
      ];
      const idx = t * (palette.length - 1);
      const i = Math.floor(idx);
      const f = idx - i;
      const c1 = palette[Math.min(i, palette.length - 1)];
      const c2 = palette[Math.min(i + 1, palette.length - 1)];
      return [
        c1[0] + (c2[0] - c1[0]) * f,
        c1[1] + (c2[1] - c1[1]) * f,
        c1[2] + (c2[2] - c1[2]) * f,
      ];
    };

    // Low-res buffer for performance
    const bufferScale = 4;
    const bufferWidth = Math.floor(canvas.width / bufferScale);
    const bufferHeight = Math.floor(canvas.height / bufferScale);
    const imageData = ctx.createImageData(bufferWidth, bufferHeight);

    const renderMandelbrot = () => {
      const aspect = canvas.width / canvas.height;

      for (let py = 0; py < bufferHeight; py++) {
        for (let px = 0; px < bufferWidth; px++) {
          const x0 = centerX + (px / bufferWidth - 0.5) * zoom * aspect;
          const y0 = centerY + (py / bufferHeight - 0.5) * zoom;

          let x = 0, y = 0;
          let iter = 0;

          while (x * x + y * y <= 4 && iter < maxIterations) {
            const xTemp = x * x - y * y + x0;
            y = 2 * x * y + y0;
            x = xTemp;
            iter++;
          }

          const color = getColor(iter, maxIterations);
          const idx = (py * bufferWidth + px) * 4;
          imageData.data[idx] = color[0];
          imageData.data[idx + 1] = color[1];
          imageData.data[idx + 2] = color[2];
          imageData.data[idx + 3] = 255;
        }
      }

      // Draw scaled up
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = bufferWidth;
      tempCanvas.height = bufferHeight;
      tempCanvas.getContext('2d').putImageData(imageData, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
    };

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      // Auto zoom
      targetZoom *= 0.998;
      zoom += (targetZoom - zoom) * 0.1;

      // Reset if too deep
      if (zoom < 0.0000001) {
        zoom = 0.005;
        targetZoom = 0.005;
        centerX = -0.745 + (Math.random() - 0.5) * 0.1;
        centerY = 0.186 + (Math.random() - 0.5) * 0.1;
      }

      // Touch to change target
      touchPointsRef.current.forEach(point => {
        if (point.active) {
          const aspect = canvas.width / canvas.height;
          centerX += (point.x / canvas.width - 0.5) * zoom * aspect * 0.1;
          centerY += (point.y / canvas.height - 0.5) * zoom * 0.1;
        }
      });

      renderMandelbrot();

      // Bloom glow
      ctx.globalCompositeOperation = 'screen';
      const glowGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.5
      );
      glowGradient.addColorStop(0, `hsla(${hue}, 52%, 68%, ${0.1 + breath * 0.05})`);
      glowGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';

      drawRipples(ctx);
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
  }, [currentMode, drawRipples]);

  // ========== TIDE POOL MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'tidepool' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Anemone class
    class Anemone {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.tentacles = 12 + Math.floor(Math.random() * 8);
        this.baseRadius = 20 + Math.random() * 15;
        this.tentacleLength = 30 + Math.random() * 20;
        this.hue = Math.random() > 0.5 ? 107 : 15; // Sage or orange
        this.retracted = 0;
        this.phase = Math.random() * Math.PI * 2;
      }

      update(elapsed) {
        this.retracted *= 0.95;
      }

      retract() {
        this.retracted = 1;
      }

      draw(ctx, elapsed, breath) {
        const sway = Math.sin(elapsed * 0.5 + this.phase) * 5;
        const length = this.tentacleLength * (1 - this.retracted * 0.7) * (0.9 + breath * 0.1);

        // Draw tentacles
        for (let i = 0; i < this.tentacles; i++) {
          const angle = (i / this.tentacles) * Math.PI * 2;
          const tipX = this.x + Math.cos(angle) * (this.baseRadius + length) + sway;
          const tipY = this.y + Math.sin(angle) * (this.baseRadius + length) * 0.5;

          ctx.strokeStyle = `hsla(${this.hue}, 50%, 55%, 0.8)`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(this.x + Math.cos(angle) * this.baseRadius, this.y + Math.sin(angle) * this.baseRadius * 0.5);
          ctx.quadraticCurveTo(
            this.x + Math.cos(angle) * (this.baseRadius + length * 0.5) + sway * 0.5,
            this.y + Math.sin(angle) * (this.baseRadius + length * 0.5) * 0.5,
            tipX, tipY
          );
          ctx.stroke();
        }

        // Center body
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.baseRadius);
        gradient.addColorStop(0, `hsla(${this.hue}, 60%, 50%, 0.9)`);
        gradient.addColorStop(1, `hsla(${this.hue}, 50%, 40%, 0.7)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.baseRadius, this.baseRadius * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Small creature class (starfish/crab)
    class Creature {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.type = Math.random() > 0.5 ? 'star' : 'crab';
        this.size = 10 + Math.random() * 10;
        this.speed = 0.1 + Math.random() * 0.1;
        this.angle = Math.random() * Math.PI * 2;
        this.rotation = Math.random() * Math.PI * 2;
      }

      update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        if (Math.random() < 0.01) this.angle += (Math.random() - 0.5) * 0.5;
        if (this.x < 0 || this.x > canvas.width) this.angle = Math.PI - this.angle;
        if (this.y < 0 || this.y > canvas.height) this.angle = -this.angle;
      }

      draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        if (this.type === 'star') {
          ctx.fillStyle = '#E07B53';
          for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.ellipse(0, -this.size, this.size * 0.3, this.size, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.rotate(Math.PI * 2 / 5);
          }
        } else {
          ctx.fillStyle = '#D4A574';
          ctx.beginPath();
          ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    }

    // Water ripple
    const waterRipples = [];

    // Initialize
    const anemones = [];
    for (let i = 0; i < 6; i++) {
      anemones.push(new Anemone(
        canvas.width * 0.2 + Math.random() * canvas.width * 0.6,
        canvas.height * 0.3 + Math.random() * canvas.height * 0.5
      ));
    }

    const creatures = [];
    for (let i = 0; i < 4; i++) {
      creatures.push(new Creature());
    }

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      // Water background
      const waterGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, canvas.width * 0.6);
      waterGradient.addColorStop(0, '#3a6070');
      waterGradient.addColorStop(1, '#1a3040');
      ctx.fillStyle = waterGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Sandy bottom pattern
      for (let x = 0; x < canvas.width; x += 20) {
        for (let y = 0; y < canvas.height; y += 20) {
          const noise = Math.sin(x * 0.05) * Math.cos(y * 0.05 + elapsed * 0.2) * 0.5 + 0.5;
          if (noise > 0.6) {
            ctx.fillStyle = `rgba(180, 160, 140, ${(noise - 0.6) * 0.3})`;
            ctx.fillRect(x, y, 15, 15);
          }
        }
      }

      // Touch interactions
      touchPointsRef.current.forEach(point => {
        if (point.active) {
          // Check anemone tap
          anemones.forEach(a => {
            const dist = Math.sqrt((point.x - a.x) ** 2 + (point.y - a.y) ** 2);
            if (dist < a.baseRadius + a.tentacleLength) {
              a.retract();
            }
          });
          // Add ripple
          if (Math.random() < 0.1) {
            waterRipples.push({ x: point.x, y: point.y, radius: 0, alpha: 0.5 });
          }
        }
      });

      // Update and draw ripples
      for (let i = waterRipples.length - 1; i >= 0; i--) {
        const r = waterRipples[i];
        r.radius += 2;
        r.alpha *= 0.97;
        if (r.alpha < 0.01) {
          waterRipples.splice(i, 1);
        } else {
          ctx.strokeStyle = `rgba(74, 144, 164, ${r.alpha})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Update and draw creatures
      creatures.forEach(c => {
        c.update();
        c.draw(ctx);
      });

      // Update and draw anemones
      anemones.forEach(a => {
        a.update(elapsed);
        a.draw(ctx, elapsed, breath);
      });

      // Caustic overlay
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 5; i++) {
        const x = canvas.width * 0.2 + Math.sin(elapsed * 0.3 + i) * canvas.width * 0.3;
        const y = canvas.height * 0.3 + Math.cos(elapsed * 0.4 + i * 0.7) * canvas.height * 0.2;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 100);
        gradient.addColorStop(0, `rgba(74, 144, 164, ${0.1 + breath * 0.05})`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, 100, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';

      drawRipples(ctx);
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
  }, [currentMode, drawRipples]);

  // ========== NEBULA MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'nebula' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    // Star particles
    const stars = [];
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        twinkle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.003 + 0.001,
      });
    }

    // Nebula cloud layers
    class NebulaCloud {
      constructor(hue) {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = 100 + Math.random() * 200;
        this.hue = hue;
        this.phase = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.0002;
      }

      draw(ctx, elapsed, breath, disturbX, disturbY) {
        const x = this.x + Math.sin(elapsed * 0.1 + this.phase) * 20 + disturbX;
        const y = this.y + Math.cos(elapsed * 0.15 + this.phase) * 15 + disturbY;
        const r = this.radius * (0.9 + breath * 0.2);

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
        gradient.addColorStop(0, `hsla(${this.hue}, 70%, 50%, 0.15)`);
        gradient.addColorStop(0.5, `hsla(${this.hue}, 60%, 40%, 0.08)`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const clouds = [];
    const hues = [hue, hue + 15, hue - 15]; // Teal variations
    for (let i = 0; i < 8; i++) {
      clouds.push(new NebulaCloud(hues[i % hues.length]));
    }

    let disturbX = 0, disturbY = 0;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      // Dark space background
      ctx.fillStyle = '#030308';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      stars.forEach(star => {
        const twinkle = 0.5 + Math.sin(now * star.speed + star.twinkle) * 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.8})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Touch disturbance
      touchPointsRef.current.forEach(point => {
        if (point.active) {
          disturbX += (point.x - canvas.width / 2) * 0.01;
          disturbY += (point.y - canvas.height / 2) * 0.01;
        }
      });
      disturbX *= 0.95;
      disturbY *= 0.95;

      // Draw nebula clouds
      ctx.globalCompositeOperation = 'screen';
      clouds.forEach(cloud => cloud.draw(ctx, elapsed, breath, disturbX, disturbY));
      ctx.globalCompositeOperation = 'source-over';

      // Center glow
      const glowGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.4
      );
      glowGradient.addColorStop(0, `hsla(${hue}, 52%, 68%, ${0.05 + breath * 0.03})`);
      glowGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawRipples(ctx);
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
  }, [currentMode, drawRipples]);

  // ========== MOSS MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'moss' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    // Grid for cellular automata
    const cellSize = 6;
    const cols = Math.ceil(canvas.width / cellSize);
    const rows = Math.ceil(canvas.height / cellSize);
    const grid = new Array(cols * rows).fill(0);

    // Initial growth points
    const seeds = 5;
    for (let i = 0; i < seeds; i++) {
      const x = Math.floor(Math.random() * cols);
      const y = Math.floor(Math.random() * rows);
      grid[y * cols + x] = 1;
    }

    // Growth function
    const grow = () => {
      const newGrowth = [];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (grid[y * cols + x] > 0) {
            // Try to grow to neighbors
            const neighbors = [
              [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1],
              [x - 1, y - 1], [x + 1, y - 1], [x - 1, y + 1], [x + 1, y + 1],
            ];
            neighbors.forEach(([nx, ny]) => {
              if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
                if (grid[ny * cols + nx] === 0 && Math.random() < 0.002) {
                  newGrowth.push([nx, ny]);
                }
              }
            });
          }
        }
      }
      newGrowth.forEach(([x, y]) => {
        grid[y * cols + x] = 0.1;
      });

      // Mature existing moss
      for (let i = 0; i < grid.length; i++) {
        if (grid[i] > 0 && grid[i] < 1) {
          grid[i] = Math.min(1, grid[i] + 0.005);
        }
      }
    };

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      // Stone background
      ctx.fillStyle = '#4a4a4a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stone texture
      for (let x = 0; x < canvas.width; x += 30) {
        for (let y = 0; y < canvas.height; y += 30) {
          const noise = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 0.5 + 0.5;
          ctx.fillStyle = `rgba(80, 80, 80, ${noise * 0.3})`;
          ctx.fillRect(x, y, 25, 25);
        }
      }

      // Touch to plant new growth
      touchPointsRef.current.forEach(point => {
        if (point.active) {
          const gx = Math.floor(point.x / cellSize);
          const gy = Math.floor(point.y / cellSize);
          if (gx >= 0 && gx < cols && gy >= 0 && gy < rows) {
            // Plant in area around touch
            for (let dx = -2; dx <= 2; dx++) {
              for (let dy = -2; dy <= 2; dy++) {
                const nx = gx + dx;
                const ny = gy + dy;
                if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
                  if (grid[ny * cols + nx] === 0 && Math.random() < 0.3) {
                    grid[ny * cols + nx] = 0.1;
                  }
                }
              }
            }
          }
        }
      });

      // Grow moss
      grow();

      // Draw moss
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const value = grid[y * cols + x];
          if (value > 0) {
            const maturity = value;
            const mossHue = 130 + (1 - maturity) * 15;
            const lightness = 30 + maturity * 15;
            ctx.fillStyle = `hsla(${mossHue}, 45%, ${lightness}%, ${maturity * 0.9})`;
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
          }
        }
      }

      // Subtle glow on moss
      ctx.globalCompositeOperation = 'screen';
      const glowGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.5
      );
      glowGradient.addColorStop(0, `hsla(130, 15%, 49%, ${0.05 + breath * 0.02})`);
      glowGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';

      drawRipples(ctx);
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
  }, [currentMode, drawRipples]);

  // ========== UNTANGLE MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'untangle' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Line nodes
    class Node {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.vx = 0;
        this.vy = 0;
      }

      update(breath) {
        // Move toward target
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        this.vx += dx * 0.01;
        this.vy += dy * 0.01;
        this.vx *= 0.95;
        this.vy *= 0.95;
        this.x += this.vx;
        this.y += this.vy;
      }
    }

    // Create tangled lines
    const lines = [];
    const nodeCount = 8;

    for (let i = 0; i < 5; i++) {
      const line = {
        nodes: [],
        color: [139, 139, 139], // Start gray
        targetColor: [74, 144, 164], // End blue
        untangled: 0,
      };

      const startAngle = (i / 5) * Math.PI * 2;
      const endAngle = startAngle + Math.PI + (Math.random() - 0.5);

      for (let j = 0; j < nodeCount; j++) {
        const t = j / (nodeCount - 1);
        // Tangled starting positions
        const angle = startAngle + (endAngle - startAngle) * t;
        const radius = 50 + Math.sin(t * Math.PI * 3 + i) * 80;
        const x = centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 100;
        const y = centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 100;
        line.nodes.push(new Node(x, y));
      }

      // Set untangled target positions (smooth curve)
      const finalRadius = 100 + i * 20;
      for (let j = 0; j < nodeCount; j++) {
        const t = j / (nodeCount - 1);
        const angle = startAngle + (endAngle - startAngle) * t;
        line.nodes[j].targetX = centerX + Math.cos(angle) * finalRadius;
        line.nodes[j].targetY = centerY + Math.sin(angle) * finalRadius;
      }

      lines.push(line);
    }

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;
      const breath = getBreathPhase(elapsed);
      const isExhaling = Math.sin(elapsed * BREATH_SPEED) < 0;

      // Dark background
      ctx.fillStyle = '#05050c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Touch to help untangle
      touchPointsRef.current.forEach(point => {
        if (point.active) {
          lines.forEach(line => {
            line.nodes.forEach(node => {
              const dx = node.x - point.x;
              const dy = node.y - point.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 100 && dist > 1) {
                // Push toward target when touched
                node.x += (node.targetX - node.x) * 0.1;
                node.y += (node.targetY - node.y) * 0.1;
              }
            });
          });
        }
      });

      // Update and draw lines
      lines.forEach(line => {
        // Calculate untangle progress
        let totalDist = 0;
        line.nodes.forEach(node => {
          node.update(breath);
          // Breath sync - exhale helps untangle
          if (isExhaling) {
            node.x += (node.targetX - node.x) * 0.002;
            node.y += (node.targetY - node.y) * 0.002;
          }
          const dx = node.x - node.targetX;
          const dy = node.y - node.targetY;
          totalDist += Math.sqrt(dx * dx + dy * dy);
        });
        line.untangled = Math.max(0, 1 - totalDist / (line.nodes.length * 100));

        // Interpolate color
        const r = line.color[0] + (line.targetColor[0] - line.color[0]) * line.untangled;
        const g = line.color[1] + (line.targetColor[1] - line.color[1]) * line.untangled;
        const b = line.color[2] + (line.targetColor[2] - line.color[2]) * line.untangled;

        // Draw line
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.8)`;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(line.nodes[0].x, line.nodes[0].y);
        for (let i = 1; i < line.nodes.length; i++) {
          ctx.lineTo(line.nodes[i].x, line.nodes[i].y);
        }
        ctx.stroke();

        // Glow on untangled parts
        if (line.untangled > 0.8) {
          ctx.strokeStyle = `rgba(74, 144, 164, ${(line.untangled - 0.8) * 2 * 0.3})`;
          ctx.lineWidth = 8;
          ctx.stroke();
        }
      });

      drawRipples(ctx);
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
  }, [currentMode, drawRipples]);

  // ========== BAMBOO WATER FEATURE MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'bamboo' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Bamboo tube state
    let fillLevel = 0;
    let tipping = false;
    let tipAngle = 0;
    let waterParticles = [];

    // Water stream
    const streamParticles = [];

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      // Background - zen garden
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, '#1a2520');
      bgGradient.addColorStop(1, '#0a1510');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Background foliage hints
      for (let i = 0; i < 8; i++) {
        const x = canvas.width * 0.1 + (i / 8) * canvas.width * 0.8;
        const height = 50 + Math.sin(i * 1.5) * 30;
        ctx.fillStyle = 'rgba(107, 142, 107, 0.2)';
        ctx.beginPath();
        ctx.ellipse(x, 50, 30, height, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Water basin
      const basinY = centerY + 100;
      ctx.fillStyle = '#2a3a35';
      ctx.beginPath();
      ctx.ellipse(centerX, basinY + 30, 120, 40, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4A90A4';
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.ellipse(centerX, basinY + 25, 100, 30, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Bamboo pivot point
      const pivotX = centerX;
      const pivotY = centerY - 20;
      const tubeLength = 120;
      const tubeWidth = 25;

      // Touch to tip early
      touchPointsRef.current.forEach(point => {
        if (point.active && !tipping) {
          const dx = point.x - pivotX;
          const dy = point.y - pivotY;
          if (Math.sqrt(dx * dx + dy * dy) < 100) {
            tipping = true;
          }
        }
      });

      // Fill the tube
      if (!tipping) {
        fillLevel += 0.003;
        if (fillLevel >= 1) {
          tipping = true;
        }
      }

      // Tipping animation
      if (tipping) {
        tipAngle += 0.05;
        if (tipAngle > Math.PI * 0.4) {
          // Spawn water particles
          if (waterParticles.length < 20) {
            waterParticles.push({
              x: pivotX + Math.cos(-Math.PI / 2 + tipAngle) * tubeLength,
              y: pivotY + Math.sin(-Math.PI / 2 + tipAngle) * tubeLength,
              vx: (Math.random() - 0.5) * 2,
              vy: 2 + Math.random() * 3,
            });
          }
        }
        if (tipAngle > Math.PI * 0.6) {
          tipAngle = 0;
          tipping = false;
          fillLevel = 0;
          waterParticles = [];
        }
      }

      // Draw bamboo tube
      ctx.save();
      ctx.translate(pivotX, pivotY);
      ctx.rotate(-Math.PI / 2 + tipAngle);

      // Tube body
      ctx.fillStyle = '#D4A574';
      ctx.beginPath();
      ctx.roundRect(-tubeWidth / 2, 0, tubeWidth, tubeLength, 5);
      ctx.fill();

      // Tube opening
      ctx.fillStyle = '#a08060';
      ctx.beginPath();
      ctx.ellipse(0, tubeLength, tubeWidth / 2, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Water inside
      if (fillLevel > 0 && !tipping) {
        ctx.fillStyle = 'rgba(74, 144, 164, 0.7)';
        const waterHeight = tubeLength * 0.8 * fillLevel;
        ctx.fillRect(-tubeWidth / 2 + 3, tubeLength - waterHeight, tubeWidth - 6, waterHeight);
      }

      ctx.restore();

      // Pivot decoration
      ctx.fillStyle = '#8B8B8B';
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Water stream from source
      if (!tipping && fillLevel > 0) {
        ctx.strokeStyle = 'rgba(74, 144, 164, 0.6)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(centerX - 80, centerY - 100);
        ctx.quadraticCurveTo(
          centerX - 40, centerY - 50,
          pivotX + Math.cos(-Math.PI / 2) * tubeLength,
          pivotY + Math.sin(-Math.PI / 2) * tubeLength
        );
        ctx.stroke();
      }

      // Draw and update water particles
      waterParticles.forEach(p => {
        p.vy += 0.2;
        p.x += p.vx;
        p.y += p.vy;

        ctx.fillStyle = 'rgba(74, 144, 164, 0.7)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Remove particles that hit basin
      waterParticles = waterParticles.filter(p => p.y < basinY + 20);

      drawRipples(ctx);
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
  }, [currentMode, drawRipples]);

  // ========== OWL MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'owl' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Owl state
    let blinkProgress = 0;
    let isBlinking = false;
    let headTilt = 0;
    let targetTilt = 0;
    let lastBlink = 0;
    let eyeContactTime = 0;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      // Dark background
      ctx.fillStyle = '#0a0a12';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Touch interactions
      let isTouching = false;
      touchPointsRef.current.forEach(point => {
        if (point.active) {
          isTouching = true;
          // Tap to tilt head
          if (Math.random() < 0.02) {
            targetTilt = (Math.random() - 0.5) * 0.3;
          }
        }
      });

      // Eye contact triggers slow blink
      if (isTouching) {
        eyeContactTime += 0.016;
        if (eyeContactTime > 2 && !isBlinking && now - lastBlink > 3000) {
          isBlinking = true;
          lastBlink = now;
          eyeContactTime = 0;
        }
      } else {
        eyeContactTime = 0;
        // Random blinks
        if (!isBlinking && Math.random() < 0.002) {
          isBlinking = true;
          lastBlink = now;
        }
      }

      // Blink animation
      if (isBlinking) {
        blinkProgress += 0.08;
        if (blinkProgress >= 1) {
          blinkProgress = 0;
          isBlinking = false;
        }
      }

      // Head tilt
      headTilt += (targetTilt - headTilt) * 0.05;
      if (Math.abs(targetTilt) > 0.01) {
        targetTilt *= 0.99;
      }

      const scale = Math.min(canvas.width, canvas.height) * 0.003;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(headTilt);

      // Face shape
      const faceGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 120 * scale);
      faceGradient.addColorStop(0, '#D4A574');
      faceGradient.addColorStop(0.7, '#a08060');
      faceGradient.addColorStop(1, '#806040');
      ctx.fillStyle = faceGradient;
      ctx.beginPath();
      ctx.ellipse(0, 0, 100 * scale, 110 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Facial disc patterns
      ctx.strokeStyle = '#c09570';
      ctx.lineWidth = 2 * scale;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.ellipse(0, 10 * scale, (60 + i * 20) * scale, (70 + i * 20) * scale, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Eyes
      const eyeY = -15 * scale;
      const eyeSpacing = 35 * scale;
      const eyeSize = 25 * scale;
      const blinkHeight = 1 - Math.sin(blinkProgress * Math.PI);

      [-1, 1].forEach(side => {
        const eyeX = side * eyeSpacing;

        // Eye ring
        ctx.fillStyle = '#E07B53';
        ctx.beginPath();
        ctx.ellipse(eyeX, eyeY, eyeSize + 5 * scale, (eyeSize + 5 * scale) * blinkHeight, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye white
        ctx.fillStyle = '#f0f0e8';
        ctx.beginPath();
        ctx.ellipse(eyeX, eyeY, eyeSize, eyeSize * blinkHeight, 0, 0, Math.PI * 2);
        ctx.fill();

        // Iris
        if (blinkHeight > 0.3) {
          ctx.fillStyle = '#4A90A4';
          ctx.beginPath();
          ctx.ellipse(eyeX, eyeY, eyeSize * 0.6, eyeSize * 0.6 * blinkHeight, 0, 0, Math.PI * 2);
          ctx.fill();

          // Pupil
          ctx.fillStyle = '#1a1a20';
          ctx.beginPath();
          ctx.ellipse(eyeX, eyeY, eyeSize * 0.3, eyeSize * 0.3 * blinkHeight, 0, 0, Math.PI * 2);
          ctx.fill();

          // Eye highlight
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.beginPath();
          ctx.ellipse(eyeX - eyeSize * 0.15, eyeY - eyeSize * 0.15, eyeSize * 0.12, eyeSize * 0.12 * blinkHeight, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Beak
      ctx.fillStyle = '#3a3530';
      ctx.beginPath();
      ctx.moveTo(0, 15 * scale);
      ctx.lineTo(-10 * scale, 35 * scale);
      ctx.lineTo(10 * scale, 35 * scale);
      ctx.closePath();
      ctx.fill();

      // Ear tufts
      [-1, 1].forEach(side => {
        ctx.fillStyle = '#a08060';
        ctx.beginPath();
        ctx.moveTo(side * 70 * scale, -60 * scale);
        ctx.lineTo(side * 90 * scale, -120 * scale);
        ctx.lineTo(side * 50 * scale, -80 * scale);
        ctx.closePath();
        ctx.fill();
      });

      ctx.restore();

      // Subtle ambient glow
      const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 200 * scale);
      glowGradient.addColorStop(0, `rgba(212, 165, 116, ${0.05 + breath * 0.02})`);
      glowGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 200 * scale, 0, Math.PI * 2);
      ctx.fill();

      drawRipples(ctx);
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
  }, [currentMode, drawRipples]);

  // ========== STEAM MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'steam' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    const centerX = canvas.width / 2;
    const cupTop = canvas.height * 0.65;

    // Steam particle class
    class SteamParticle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = centerX + (Math.random() - 0.5) * 40;
        this.y = cupTop - 20;
        this.size = 8 + Math.random() * 15;
        this.life = 1;
        this.decay = 0.005 + Math.random() * 0.005;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = -0.5 - Math.random() * 0.5;
        this.phase = Math.random() * Math.PI * 2;
        this.dispersed = false;
      }

      update(elapsed) {
        if (this.dispersed) {
          this.life -= this.decay * 3;
          this.size *= 1.02;
        } else {
          this.life -= this.decay;
          this.size += 0.1;
        }

        this.x += this.vx + Math.sin(elapsed * 2 + this.phase) * 0.3;
        this.y += this.vy;

        if (this.life <= 0) this.reset();
      }

      disperse() {
        this.dispersed = true;
        this.vx += (Math.random() - 0.5) * 3;
        this.vy -= 2;
      }

      draw(ctx) {
        const alpha = this.life * 0.4;
        ctx.fillStyle = `rgba(200, 200, 200, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Initialize steam particles
    const steamParticles = [];
    for (let i = 0; i < 25; i++) {
      const p = new SteamParticle();
      p.y = cupTop - 20 - Math.random() * 150;
      p.life = Math.random();
      steamParticles.push(p);
    }

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      // Warm dark background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, '#0a0808');
      bgGradient.addColorStop(1, '#151210');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Touch to disperse steam
      touchPointsRef.current.forEach(point => {
        if (point.active) {
          steamParticles.forEach(p => {
            const dx = p.x - point.x;
            const dy = p.y - point.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 80) {
              p.disperse();
            }
          });
        }
      });

      // Warm glow from cup
      const warmGlow = ctx.createRadialGradient(centerX, cupTop + 30, 0, centerX, cupTop + 30, 150);
      warmGlow.addColorStop(0, 'rgba(212, 165, 116, 0.15)');
      warmGlow.addColorStop(0.5, 'rgba(212, 165, 116, 0.05)');
      warmGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = warmGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw steam
      steamParticles.forEach(p => {
        p.update(elapsed);
        p.draw(ctx);
      });

      // Tea cup
      const cupWidth = 80;
      const cupHeight = 60;

      // Cup body
      ctx.fillStyle = '#f5f0e8';
      ctx.beginPath();
      ctx.moveTo(centerX - cupWidth / 2, cupTop);
      ctx.lineTo(centerX - cupWidth / 2 + 10, cupTop + cupHeight);
      ctx.lineTo(centerX + cupWidth / 2 - 10, cupTop + cupHeight);
      ctx.lineTo(centerX + cupWidth / 2, cupTop);
      ctx.closePath();
      ctx.fill();

      // Cup rim
      ctx.fillStyle = '#e8e0d8';
      ctx.beginPath();
      ctx.ellipse(centerX, cupTop, cupWidth / 2, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tea surface
      ctx.fillStyle = '#8B6914';
      ctx.beginPath();
      ctx.ellipse(centerX, cupTop + 5, cupWidth / 2 - 5, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cup handle
      ctx.strokeStyle = '#f5f0e8';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(centerX + cupWidth / 2 + 15, cupTop + cupHeight / 2, 20, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();

      // Saucer
      ctx.fillStyle = '#f0ebe0';
      ctx.beginPath();
      ctx.ellipse(centerX, cupTop + cupHeight + 10, cupWidth * 0.8, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      drawRipples(ctx);
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
  }, [currentMode, drawRipples]);

  // ========== MOON MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'moon' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Moon phase (0 = new, 0.5 = full, 1 = new again)
    let phase = 0.5;
    let targetPhase = 0.5;

    // Stars
    const stars = [];
    for (let i = 0; i < 150; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5,
        twinkle: Math.random() * Math.PI * 2,
      });
    }

    // Craters
    const craters = [];
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 0.7;
      craters.push({
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        size: 0.05 + Math.random() * 0.1,
      });
    }

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      // Night sky
      const skyGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, canvas.width * 0.7);
      skyGradient.addColorStop(0, '#0f0f20');
      skyGradient.addColorStop(1, '#050510');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Touch to change phase
      touchPointsRef.current.forEach(point => {
        if (point.active) {
          const dx = point.x - centerX;
          targetPhase += dx * 0.0001;
          targetPhase = ((targetPhase % 1) + 1) % 1;
        }
      });

      // Auto phase cycle
      targetPhase += 0.0001;
      if (targetPhase > 1) targetPhase = 0;

      phase += (targetPhase - phase) * 0.05;

      // Draw stars
      stars.forEach(star => {
        const twinkle = 0.5 + Math.sin(now * 0.003 + star.twinkle) * 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.7})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      const moonRadius = Math.min(canvas.width, canvas.height) * 0.2;

      // Moon glow
      const glowGradient = ctx.createRadialGradient(centerX, centerY, moonRadius * 0.8, centerX, centerY, moonRadius * 2);
      glowGradient.addColorStop(0, `rgba(212, 200, 180, ${0.2 + breath * 0.1})`);
      glowGradient.addColorStop(0.5, 'rgba(180, 170, 160, 0.05)');
      glowGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, moonRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Moon base
      const moonGradient = ctx.createRadialGradient(
        centerX - moonRadius * 0.3, centerY - moonRadius * 0.3, 0,
        centerX, centerY, moonRadius
      );
      moonGradient.addColorStop(0, '#f5f0e5');
      moonGradient.addColorStop(0.5, '#e8e0d5');
      moonGradient.addColorStop(1, '#d0c8c0');
      ctx.fillStyle = moonGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, moonRadius, 0, Math.PI * 2);
      ctx.fill();

      // Craters
      craters.forEach(crater => {
        const cx = centerX + crater.x * moonRadius;
        const cy = centerY + crater.y * moonRadius;
        const cr = crater.size * moonRadius;

        ctx.fillStyle = 'rgba(180, 170, 160, 0.3)';
        ctx.beginPath();
        ctx.arc(cx, cy, cr, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(200, 190, 180, 0.2)';
        ctx.beginPath();
        ctx.arc(cx - cr * 0.2, cy - cr * 0.2, cr * 0.7, 0, Math.PI * 2);
        ctx.fill();
      });

      // Phase shadow
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, moonRadius, 0, Math.PI * 2);
      ctx.clip();

      // Calculate shadow position based on phase
      const shadowPhase = phase * Math.PI * 2;
      const shadowX = centerX + Math.cos(shadowPhase) * moonRadius * 2;

      ctx.fillStyle = 'rgba(5, 5, 15, 0.95)';
      ctx.beginPath();
      ctx.arc(shadowX, centerY, moonRadius * 1.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      drawRipples(ctx);
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
  }, [currentMode, drawRipples]);

  // ========== KALEIDOSCOPE MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'kaleidoscope' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const segments = 8;

    // Floating shapes
    const shapes = [];
    for (let i = 0; i < 15; i++) {
      shapes.push({
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: 10 + Math.random() * 30,
        hue: hue + (Math.random() - 0.5) * 30, // Teal with variation
        type: Math.floor(Math.random() * 3),
      });
    }

    let touchX = 0, touchY = 0;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      // Dark background
      ctx.fillStyle = '#05050c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Touch influence
      touchPointsRef.current.forEach(point => {
        if (point.active) {
          touchX = point.x - centerX;
          touchY = point.y - centerY;
        }
      });
      touchX *= 0.95;
      touchY *= 0.95;

      // Update shapes
      shapes.forEach(shape => {
        shape.x += shape.vx + touchX * 0.01;
        shape.y += shape.vy + touchY * 0.01;

        // Bounce
        const maxDist = 150;
        const dist = Math.sqrt(shape.x * shape.x + shape.y * shape.y);
        if (dist > maxDist) {
          const angle = Math.atan2(shape.y, shape.x);
          shape.x = Math.cos(angle) * maxDist;
          shape.y = Math.sin(angle) * maxDist;
          shape.vx = -shape.vx * 0.8;
          shape.vy = -shape.vy * 0.8;
        }
      });

      // Draw kaleidoscope
      const maxRadius = Math.min(canvas.width, canvas.height) * 0.45;

      for (let i = 0; i < segments; i++) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate((i / segments) * Math.PI * 2 + elapsed * 0.1);

        // Clip to segment
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(maxRadius, 0);
        ctx.arc(0, 0, maxRadius, 0, Math.PI / (segments / 2));
        ctx.closePath();
        ctx.clip();

        // Mirror for even segments
        if (i % 2 === 1) {
          ctx.scale(1, -1);
        }

        // Draw shapes in this segment
        shapes.forEach(shape => {
          const alpha = 0.6 + breath * 0.2;
          ctx.fillStyle = `hsla(${shape.hue}, 70%, 55%, ${alpha})`;

          ctx.beginPath();
          if (shape.type === 0) {
            ctx.arc(shape.x + 75, shape.y + 75, shape.size, 0, Math.PI * 2);
          } else if (shape.type === 1) {
            ctx.rect(shape.x + 75 - shape.size / 2, shape.y + 75 - shape.size / 2, shape.size, shape.size);
          } else {
            const s = shape.size;
            ctx.moveTo(shape.x + 75, shape.y + 75 - s);
            ctx.lineTo(shape.x + 75 + s, shape.y + 75 + s);
            ctx.lineTo(shape.x + 75 - s, shape.y + 75 + s);
            ctx.closePath();
          }
          ctx.fill();
        });

        ctx.restore();
      }

      // Center glow
      const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 50);
      glowGradient.addColorStop(0, `hsla(${hue}, 52%, 68%, ${0.3 + breath * 0.1})`);
      glowGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
      ctx.fill();

      drawRipples(ctx);
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
  }, [currentMode, drawRipples]);

  // ========== MUSHROOMS MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'mushrooms' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    // Mushroom class
    class Mushroom {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.capRadius = 20 + Math.random() * 25;
        this.stemHeight = 25 + Math.random() * 20;
        this.stemWidth = 8 + Math.random() * 6;
        this.hue = hue + (Math.random() - 0.5) * 20; // Teal with variation
        this.phase = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.5 + Math.random() * 0.5;
        this.spores = [];
      }

      addSpores() {
        for (let i = 0; i < 8; i++) {
          this.spores.push({
            x: this.x,
            y: this.y - this.stemHeight - this.capRadius * 0.5,
            vx: (Math.random() - 0.5) * 2,
            vy: -1 - Math.random() * 2,
            size: 2 + Math.random() * 3,
            life: 1,
          });
        }
      }

      update(elapsed) {
        // Update spores
        this.spores = this.spores.filter(spore => {
          spore.x += spore.vx;
          spore.y += spore.vy;
          spore.vy -= 0.01;
          spore.life -= 0.01;
          return spore.life > 0;
        });
      }

      draw(ctx, elapsed, breath) {
        const pulse = 0.5 + Math.sin(elapsed * this.pulseSpeed + this.phase) * 0.5;
        const glowIntensity = 0.3 + pulse * 0.4 + breath * 0.2;

        // Stem
        ctx.fillStyle = PALETTE.gray;
        ctx.beginPath();
        ctx.moveTo(this.x - this.stemWidth / 2, this.y);
        ctx.lineTo(this.x - this.stemWidth / 3, this.y - this.stemHeight);
        ctx.lineTo(this.x + this.stemWidth / 3, this.y - this.stemHeight);
        ctx.lineTo(this.x + this.stemWidth / 2, this.y);
        ctx.closePath();
        ctx.fill();

        // Cap glow
        const glowGradient = ctx.createRadialGradient(
          this.x, this.y - this.stemHeight, 0,
          this.x, this.y - this.stemHeight, this.capRadius * 2
        );
        glowGradient.addColorStop(0, `hsla(${this.hue}, 70%, 50%, ${glowIntensity * 0.5})`);
        glowGradient.addColorStop(0.5, `hsla(${this.hue}, 60%, 40%, ${glowIntensity * 0.2})`);
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y - this.stemHeight, this.capRadius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Cap
        const capGradient = ctx.createRadialGradient(
          this.x - this.capRadius * 0.3, this.y - this.stemHeight - this.capRadius * 0.3, 0,
          this.x, this.y - this.stemHeight, this.capRadius
        );
        capGradient.addColorStop(0, `hsla(${this.hue}, 70%, 60%, 0.9)`);
        capGradient.addColorStop(0.7, `hsla(${this.hue}, 60%, 45%, 0.8)`);
        capGradient.addColorStop(1, `hsla(${this.hue}, 50%, 35%, 0.7)`);
        ctx.fillStyle = capGradient;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y - this.stemHeight, this.capRadius, this.capRadius * 0.6, 0, Math.PI, Math.PI * 2);
        ctx.fill();

        // Spots on cap
        for (let i = 0; i < 5; i++) {
          const spotAngle = (i / 5) * Math.PI + 0.3;
          const spotDist = this.capRadius * 0.5;
          const spotX = this.x + Math.cos(spotAngle) * spotDist;
          const spotY = this.y - this.stemHeight - Math.sin(spotAngle) * spotDist * 0.5;
          ctx.fillStyle = `hsla(${this.hue}, 80%, 70%, ${0.5 + pulse * 0.3})`;
          ctx.beginPath();
          ctx.arc(spotX, spotY, 3 + Math.random() * 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw spores
        this.spores.forEach(spore => {
          ctx.fillStyle = `hsla(${this.hue}, 60%, 60%, ${spore.life * 0.6})`;
          ctx.beginPath();
          ctx.arc(spore.x, spore.y, spore.size * spore.life, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    }

    // Initialize mushrooms
    const mushrooms = [];
    for (let i = 0; i < 8; i++) {
      mushrooms.push(new Mushroom(
        canvas.width * 0.15 + (i / 8) * canvas.width * 0.7 + (Math.random() - 0.5) * 50,
        canvas.height * 0.7 + Math.random() * canvas.height * 0.15
      ));
    }

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      // Forest floor background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, '#0a0a10');
      bgGradient.addColorStop(0.6, '#0f1015');
      bgGradient.addColorStop(1, '#15181d');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Ground texture
      ctx.fillStyle = 'rgba(60, 55, 50, 0.3)';
      for (let x = 0; x < canvas.width; x += 30) {
        const y = canvas.height * 0.75 + Math.sin(x * 0.05) * 20;
        ctx.beginPath();
        ctx.ellipse(x, y, 20, 8, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Touch to release spores
      touchPointsRef.current.forEach(point => {
        if (point.active) {
          mushrooms.forEach(m => {
            const dist = Math.sqrt((point.x - m.x) ** 2 + (point.y - (m.y - m.stemHeight)) ** 2);
            if (dist < m.capRadius + 30 && m.spores.length < 20) {
              m.addSpores();
            }
          });
        }
      });

      // Update and draw mushrooms
      mushrooms.forEach(m => {
        m.update(elapsed);
        m.draw(ctx, elapsed, breath);
      });

      drawRipples(ctx);
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
  }, [currentMode, drawRipples]);

  // ========== LANTERNS MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'lanterns' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    // Lantern class
    class Lantern {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 30 + Math.random() * 20;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = -0.5 - Math.random() * 0.5;
        this.rotation = (Math.random() - 0.5) * 0.1;
        this.rotationSpeed = (Math.random() - 0.5) * 0.002;
        this.hue = hue + Math.random() * 15; // Teal from palette
        this.alpha = 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;

        // Shrink as they rise
        if (this.y < canvas.height * 0.3) {
          this.size *= 0.998;
          this.alpha *= 0.998;
        }

        // Remove when off screen or too small
        return this.y > -100 && this.size > 5 && this.alpha > 0.1;
      }

      draw(ctx, breath) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.alpha;

        // Lantern glow
        const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 2);
        glowGradient.addColorStop(0, `hsla(${this.hue}, 80%, 55%, ${0.4 + breath * 0.1})`);
        glowGradient.addColorStop(0.5, `hsla(${this.hue}, 70%, 45%, 0.1)`);
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 2, 0, Math.PI * 2);
        ctx.fill();

        // Lantern body
        const bodyGradient = ctx.createLinearGradient(-this.size / 2, -this.size, this.size / 2, this.size);
        bodyGradient.addColorStop(0, `hsla(${this.hue}, 70%, 60%, 0.9)`);
        bodyGradient.addColorStop(0.5, `hsla(${this.hue - 5}, 80%, 55%, 0.95)`);
        bodyGradient.addColorStop(1, `hsla(${this.hue}, 70%, 50%, 0.85)`);
        ctx.fillStyle = bodyGradient;

        // Lantern shape
        ctx.beginPath();
        ctx.moveTo(-this.size * 0.3, -this.size);
        ctx.quadraticCurveTo(-this.size * 0.6, 0, -this.size * 0.3, this.size);
        ctx.lineTo(this.size * 0.3, this.size);
        ctx.quadraticCurveTo(this.size * 0.6, 0, this.size * 0.3, -this.size);
        ctx.closePath();
        ctx.fill();

        // Top and bottom caps - use darker version of lantern hue
        ctx.fillStyle = `hsl(${this.hue}, 40%, 35%)`;
        ctx.fillRect(-this.size * 0.2, -this.size - 5, this.size * 0.4, 8);
        ctx.fillRect(-this.size * 0.15, this.size - 3, this.size * 0.3, 6);

        ctx.restore();
        ctx.globalAlpha = 1;
      }
    }

    // Stars
    const stars = [];
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.7,
        size: Math.random() * 1.5 + 0.5,
        twinkle: Math.random() * Math.PI * 2,
      });
    }

    const lanterns = [];

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      // Night sky
      const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGradient.addColorStop(0, '#05050f');
      skyGradient.addColorStop(0.7, '#0a0a18');
      skyGradient.addColorStop(1, '#101025');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      stars.forEach(star => {
        const twinkle = 0.5 + Math.sin(now * 0.002 + star.twinkle) * 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.6})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Touch to release lantern
      touchPointsRef.current.forEach(point => {
        if (point.active && lanterns.length < 20 && Math.random() < 0.05) {
          lanterns.push(new Lantern(point.x, canvas.height + 50));
        }
      });

      // Auto release occasionally
      if (Math.random() < 0.005 && lanterns.length < 15) {
        lanterns.push(new Lantern(
          canvas.width * 0.2 + Math.random() * canvas.width * 0.6,
          canvas.height + 50
        ));
      }

      // Update and draw lanterns
      for (let i = lanterns.length - 1; i >= 0; i--) {
        if (!lanterns[i].update()) {
          lanterns.splice(i, 1);
        } else {
          lanterns[i].draw(ctx, breath);
        }
      }

      drawRipples(ctx);
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
  }, [currentMode, drawRipples]);

  // ========== HEART SYNC MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'heartSync' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Two hearts with different rhythms - using selected hue with variations
    const hearts = [
      { x: centerX - 80, phase: 0, speed: 1.2, hue: hue, baseSize: 40 },
      { x: centerX + 80, phase: Math.PI, speed: 0.8, hue: hue + 30, baseSize: 40 },
    ];

    let syncLevel = 0;
    let lastTapTime = 0;
    let tapRhythm = 1;

    // Draw heart shape
    const drawHeart = (x, y, size, hue, pulse) => {
      const s = size * (0.9 + pulse * 0.2);

      // Heart glow
      const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, s * 2);
      glowGradient.addColorStop(0, `hsla(${hue}, 70%, 50%, ${0.2 + pulse * 0.2})`);
      glowGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(x, y, s * 2, 0, Math.PI * 2);
      ctx.fill();

      // Heart shape
      ctx.fillStyle = `hsla(${hue}, 70%, 55%, 0.9)`;
      ctx.beginPath();
      ctx.moveTo(x, y + s * 0.7);
      ctx.bezierCurveTo(x - s * 1.5, y - s * 0.5, x - s * 0.8, y - s * 1.3, x, y - s * 0.6);
      ctx.bezierCurveTo(x + s * 0.8, y - s * 1.3, x + s * 1.5, y - s * 0.5, x, y + s * 0.7);
      ctx.fill();

      // Highlight
      ctx.fillStyle = `hsla(${hue}, 60%, 70%, 0.4)`;
      ctx.beginPath();
      ctx.ellipse(x - s * 0.3, y - s * 0.4, s * 0.25, s * 0.2, -0.3, 0, Math.PI * 2);
      ctx.fill();
    };

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      // Dark background
      ctx.fillStyle = '#05050c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Touch to set rhythm for first heart
      touchPointsRef.current.forEach(point => {
        if (point.active) {
          const timeSinceTap = now - lastTapTime;
          if (timeSinceTap > 200) {
            tapRhythm = Math.max(0.5, Math.min(2, 1000 / timeSinceTap));
            lastTapTime = now;
            hearts[0].speed = tapRhythm;
          }
        }
      });

      // Second heart gradually syncs to first
      const speedDiff = hearts[0].speed - hearts[1].speed;
      hearts[1].speed += speedDiff * 0.001;

      // Calculate sync level based on phase alignment
      const phaseDiff = Math.abs(Math.sin(hearts[0].phase) - Math.sin(hearts[1].phase));
      syncLevel = 1 - phaseDiff;

      // Breath sync option - first heart follows breath
      const isInhaling = Math.sin(elapsed * BREATH_SPEED) > 0;
      if (isInhaling) {
        hearts[0].phase += 0.02;
      }

      // Update and draw hearts
      hearts.forEach((heart, i) => {
        heart.phase += 0.05 * heart.speed;
        const pulse = (Math.sin(heart.phase) + 1) / 2;

        // Merge color when synced
        let drawHue = heart.hue;
        if (syncLevel > 0.8) {
          drawHue = hue; // Use selected hue when synced
        }

        drawHeart(heart.x, centerY, heart.baseSize, drawHue, pulse);
      });

      // Sync burst effect
      if (syncLevel > 0.9) {
        const burstGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 150);
        burstGradient.addColorStop(0, `hsla(${hue}, 52%, 68%, ${(syncLevel - 0.9) * 2})`);
        burstGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = burstGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 150, 0, Math.PI * 2);
        ctx.fill();
      }

      // Connection line between hearts
      ctx.strokeStyle = `rgba(180, 150, 200, ${0.2 + syncLevel * 0.3})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(hearts[0].x + 30, centerY);
      ctx.lineTo(hearts[1].x - 30, centerY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Sync indicator
      ctx.fillStyle = `rgba(255, 255, 255, 0.5)`;
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Sync: ${Math.round(syncLevel * 100)}%`, centerX, centerY + 100);

      drawRipples(ctx);
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
  }, [currentMode, drawRipples]);

  // ========== KLEIN BOTTLE MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'kleinBottle' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    // Klein bottle parametric surface
    const kleinPoints = [];
    const uSteps = 60;
    const vSteps = 30;

    for (let i = 0; i <= uSteps; i++) {
      kleinPoints[i] = [];
      const u = (i / uSteps) * Math.PI * 2;
      for (let j = 0; j <= vSteps; j++) {
        const v = (j / vSteps) * Math.PI * 2;
        let x, y, z;

        // Klein bottle immersion
        const r = 4 * (1 - Math.cos(u) / 2);
        if (u < Math.PI) {
          x = 6 * Math.cos(u) * (1 + Math.sin(u)) + r * Math.cos(u) * Math.cos(v);
          y = 16 * Math.sin(u) + r * Math.sin(u) * Math.cos(v);
        } else {
          x = 6 * Math.cos(u) * (1 + Math.sin(u)) + r * Math.cos(v + Math.PI);
          y = 16 * Math.sin(u);
        }
        z = r * Math.sin(v);

        kleinPoints[i][j] = { x: x * 8, y: y * 8, z: z * 8 };
      }
    }

    let rotationY = 0;
    let rotationX = 0.3;
    let targetRotationY = 0;
    let targetRotationX = 0.3;

    const project = (point, rotY, rotX, breath) => {
      const scale = 1 + breath * 0.15;
      let x = point.x * scale;
      let y = point.y * scale;
      let z = point.z * scale;

      // Rotate Y
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      // Rotate X
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y1 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      const perspective = 800 / (800 + z2);
      return {
        x: canvas.width / 2 + x1 * perspective,
        y: canvas.height / 2 + y1 * perspective,
        z: z2
      };
    };

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = (Date.now() - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Auto rotation
      targetRotationY += 0.003;

      // Smooth rotation
      rotationY += (targetRotationY - rotationY) * 0.1;
      rotationX += (targetRotationX - rotationX) * 0.1;

      // Mouse interaction
      touchPointsRef.current.forEach(point => {
        if (point.active) {
          targetRotationY += (point.x - canvas.width / 2) * 0.00005;
          targetRotationX += (point.y - canvas.height / 2) * 0.00005;
        }
      });

      // Draw wireframe
      const brightness = 0.3 + breath * 0.7;
      ctx.strokeStyle = `hsla(${hue}, 70%, ${50 + breath * 20}%, ${brightness})`;
      ctx.lineWidth = 1;

      // Draw U lines
      for (let i = 0; i < uSteps; i++) {
        ctx.beginPath();
        for (let j = 0; j <= vSteps; j++) {
          const p = project(kleinPoints[i][j], rotationY, rotationX, breath);
          if (j === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      // Draw V lines
      for (let j = 0; j < vSteps; j++) {
        ctx.beginPath();
        for (let i = 0; i <= uSteps; i++) {
          const p = project(kleinPoints[i][j], rotationY, rotationX, breath);
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      drawRipples(ctx);
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
  }, [currentMode, hue, getBreathPhase, drawRipples]);

  // ========== MÖBIUS STRIP MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'mobiusStrip' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    // Möbius strip parametric
    const mobiusPoints = [];
    const uSteps = 80;
    const vSteps = 12;

    const generateMobius = (twist = 1) => {
      for (let i = 0; i <= uSteps; i++) {
        mobiusPoints[i] = [];
        const u = (i / uSteps) * Math.PI * 2;
        for (let j = 0; j <= vSteps; j++) {
          const v = (j / vSteps - 0.5);
          const x = (1 + v / 2 * Math.cos(u * twist / 2)) * Math.cos(u);
          const y = (1 + v / 2 * Math.cos(u * twist / 2)) * Math.sin(u);
          const z = v / 2 * Math.sin(u * twist / 2);
          mobiusPoints[i][j] = { x: x * 150, y: y * 150, z: z * 150 };
        }
      }
    };

    generateMobius(1);

    let rotationY = 0;
    let rotationX = 0.5;

    const project = (point, rotY, rotX) => {
      let x = point.x;
      let y = point.y;
      let z = point.z;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y1 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      const perspective = 600 / (600 + z2);
      return {
        x: canvas.width / 2 + x1 * perspective,
        y: canvas.height / 2 + y1 * perspective,
        z: z2
      };
    };

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = (Date.now() - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      rotationY += 0.005;

      // Mouse interaction
      touchPointsRef.current.forEach(point => {
        if (point.active) {
          rotationX += (point.y - canvas.height / 2) * 0.0001;
        }
      });

      // Regenerate with twist based on breath
      const twist = 1 - breath * 0.3;
      generateMobius(twist);

      const brightness = 0.4 + breath * 0.6;
      ctx.strokeStyle = `hsla(${hue}, 70%, ${55 + breath * 15}%, ${brightness})`;
      ctx.lineWidth = 1.5;

      // Draw strips
      for (let i = 0; i < uSteps; i++) {
        ctx.beginPath();
        for (let j = 0; j <= vSteps; j++) {
          const p = project(mobiusPoints[i][j], rotationY, rotationX);
          if (j === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      // Edge glow
      ctx.strokeStyle = `hsla(${hue}, 80%, 70%, ${0.3 + breath * 0.4})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= uSteps; i++) {
        const p = project(mobiusPoints[i][0], rotationY, rotationX);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();

      drawRipples(ctx);
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
  }, [currentMode, hue, getBreathPhase, drawRipples]);

  // ========== TREFOIL KNOT MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'trefoilKnot' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    // Generate trefoil knot points
    const knotPoints = [];
    const segments = 200;
    const tubeRadius = 25;

    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      const x = Math.sin(t) + 2 * Math.sin(2 * t);
      const y = Math.cos(t) - 2 * Math.cos(2 * t);
      const z = -Math.sin(3 * t);
      knotPoints.push({ x: x * 80, y: y * 80, z: z * 80 });
    }

    // Particles along knot
    const particles = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        t: (i / 50) * Math.PI * 2,
        offset: Math.random() * Math.PI * 2,
        size: 2 + Math.random() * 3
      });
    }

    let rotationY = 0;
    let rotationX = 0.4;

    const project = (x, y, z, rotY, rotX, scale = 1) => {
      x *= scale;
      y *= scale;
      z *= scale;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y1 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      const perspective = 500 / (500 + z2);
      return {
        x: canvas.width / 2 + x1 * perspective,
        y: canvas.height / 2 + y1 * perspective,
        z: z2
      };
    };

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = (Date.now() - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      rotationY += 0.004;

      // Mouse interaction
      touchPointsRef.current.forEach(point => {
        if (point.active) {
          rotationX = (point.y / canvas.height - 0.5) * 2;
        }
      });

      const scale = 1 + breath * 0.15;
      const brightness = 0.4 + breath * 0.6;

      // Draw knot wireframe
      ctx.strokeStyle = `hsla(${hue}, 70%, ${55 + breath * 15}%, ${brightness})`;
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let i = 0; i <= segments; i++) {
        const p = project(knotPoints[i].x, knotPoints[i].y, knotPoints[i].z, rotationY, rotationX, scale);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();

      // Draw particles
      particles.forEach((particle, idx) => {
        particle.t += 0.01;
        const t = particle.t % (Math.PI * 2);
        const x = (Math.sin(t) + 2 * Math.sin(2 * t)) * 80;
        const y = (Math.cos(t) - 2 * Math.cos(2 * t)) * 80;
        const z = -Math.sin(3 * t) * 80;

        const p = project(x, y, z, rotationY, rotationX, scale);
        const pulseSize = particle.size * (0.8 + 0.4 * Math.sin(elapsed * 2 + particle.offset));

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pulseSize * (1 + breath));
        gradient.addColorStop(0, `hsla(${hue + 20}, 80%, 70%, ${0.8 * brightness})`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, pulseSize * (1 + breath), 0, Math.PI * 2);
        ctx.fill();
      });

      drawRipples(ctx);
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
  }, [currentMode, hue, getBreathPhase, drawRipples]);

  // ========== GYROID SURFACE MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'gyroid' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    // Simplified gyroid visualization using layered sine waves
    const layers = 12;
    const pointsPerLayer = 60;
    let rotationY = 0;
    let rotationX = 0.3;

    const gyroidValue = (x, y, z) => {
      return Math.sin(x) * Math.cos(y) + Math.sin(y) * Math.cos(z) + Math.sin(z) * Math.cos(x);
    };

    const project = (x, y, z, rotY, rotX) => {
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y1 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      const perspective = 400 / (400 + z2);
      return {
        x: canvas.width / 2 + x1 * perspective,
        y: canvas.height / 2 + y1 * perspective,
        z: z2
      };
    };

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = (Date.now() - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      rotationY += 0.002;

      // Mouse interaction
      touchPointsRef.current.forEach(point => {
        if (point.active) {
          rotationX = (point.y / canvas.height - 0.5) * 1.5;
        }
      });

      const scale = 80 * (1 + breath * 0.1);
      const brightness = 0.3 + breath * 0.7;

      // Draw gyroid iso-surface approximation
      ctx.strokeStyle = `hsla(${hue}, 70%, ${55 + breath * 15}%, ${brightness * 0.6})`;
      ctx.lineWidth = 1;

      // Sample points on gyroid surface
      const range = Math.PI;
      const step = range / 15;

      for (let x = -range; x <= range; x += step) {
        for (let y = -range; y <= range; y += step) {
          // Find z where gyroid ≈ 0
          for (let z = -range; z <= range; z += step) {
            const val = gyroidValue(x, y, z);
            if (Math.abs(val) < 0.3) {
              const p = project(x * scale, y * scale, z * scale, rotationY, rotationX);
              const dist = Math.sqrt(x * x + y * y + z * z);
              const alpha = Math.max(0, 1 - dist / (range * 1.5));

              ctx.fillStyle = `hsla(${hue}, 70%, ${60 + breath * 20}%, ${alpha * brightness})`;
              ctx.beginPath();
              ctx.arc(p.x, p.y, 2 + breath * 2, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      // Draw connecting lines for structure
      ctx.strokeStyle = `hsla(${hue}, 60%, 50%, ${brightness * 0.3})`;
      for (let layer = 0; layer < 6; layer++) {
        const z = (layer / 6 - 0.5) * Math.PI * 2;
        ctx.beginPath();
        for (let i = 0; i <= 40; i++) {
          const angle = (i / 40) * Math.PI * 2;
          const r = 60 + Math.sin(angle * 3 + z * 2 + elapsed) * 20;
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;
          const p = project(x * (1 + breath * 0.1), y * (1 + breath * 0.1), z * 30, rotationY, rotationX);
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      drawRipples(ctx);
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
  }, [currentMode, hue, getBreathPhase, drawRipples]);

  // ========== RADIOLARIAN SKELETON MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'radiolarian' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    // Icosahedron vertices (golden ratio based)
    const phi = (1 + Math.sqrt(5)) / 2;
    const icosaVertices = [
      [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
      [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
      [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
    ].map(v => ({ x: v[0] * 100, y: v[1] * 100, z: v[2] * 100 }));

    // Icosahedron edges
    const icosaEdges = [
      [0,1], [0,5], [0,7], [0,10], [0,11],
      [1,5], [1,7], [1,8], [1,9],
      [2,3], [2,4], [2,6], [2,10], [2,11],
      [3,4], [3,6], [3,8], [3,9],
      [4,5], [4,9], [4,11],
      [5,9], [5,11],
      [6,7], [6,8], [6,10],
      [7,8], [7,10],
      [8,9], [10,11]
    ];

    let rotationY = 0;
    let rotationX = 0.4;
    let spineExtension = 0;

    const project = (x, y, z, rotY, rotX, scale = 1) => {
      x *= scale;
      y *= scale;
      z *= scale;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y1 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      const perspective = 500 / (500 + z2);
      return {
        x: canvas.width / 2 + x1 * perspective,
        y: canvas.height / 2 + y1 * perspective,
        z: z2
      };
    };

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = (Date.now() - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      rotationY += 0.003;
      rotationX = 0.4 + Math.sin(elapsed * 0.2) * 0.1;

      // Mouse interaction - spines point toward cursor
      let mouseInfluence = { x: 0, y: 0 };
      touchPointsRef.current.forEach(point => {
        if (point.active) {
          mouseInfluence.x = (point.x - canvas.width / 2) / canvas.width;
          mouseInfluence.y = (point.y - canvas.height / 2) / canvas.height;
          spineExtension = 1.5;
        }
      });
      spineExtension *= 0.95;

      const scale = 1 + breath * 0.15;
      const brightness = 0.4 + breath * 0.6;

      // Draw outer shell (icosahedron)
      ctx.strokeStyle = `hsla(${hue}, 70%, ${55 + breath * 15}%, ${brightness})`;
      ctx.lineWidth = 1.5;

      icosaEdges.forEach(([i, j]) => {
        const p1 = project(icosaVertices[i].x, icosaVertices[i].y, icosaVertices[i].z, rotationY, rotationX, scale);
        const p2 = project(icosaVertices[j].x, icosaVertices[j].y, icosaVertices[j].z, rotationY, rotationX, scale);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });

      // Draw inner sphere
      ctx.strokeStyle = `hsla(${hue + 20}, 60%, 45%, ${brightness * 0.7})`;
      const innerScale = 0.4 * (0.9 + Math.sin(elapsed) * 0.1);
      icosaEdges.forEach(([i, j]) => {
        const p1 = project(icosaVertices[i].x * innerScale, icosaVertices[i].y * innerScale, icosaVertices[i].z * innerScale, rotationY, rotationX, scale);
        const p2 = project(icosaVertices[j].x * innerScale, icosaVertices[j].y * innerScale, icosaVertices[j].z * innerScale, rotationY, rotationX, scale);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });

      // Draw spines
      ctx.strokeStyle = `hsla(${hue + 30}, 80%, 70%, ${brightness})`;
      ctx.lineWidth = 2;
      icosaVertices.forEach((v, idx) => {
        const len = 1 + v.x * 0.001 * mouseInfluence.x + v.y * 0.001 * mouseInfluence.y;
        const spineLen = (0.5 + spineExtension * 0.3 + breath * 0.1) * len;
        const norm = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
        const spineEnd = {
          x: v.x * (1 + spineLen / norm * 50),
          y: v.y * (1 + spineLen / norm * 50),
          z: v.z * (1 + spineLen / norm * 50)
        };

        const p1 = project(v.x, v.y, v.z, rotationY, rotationX, scale);
        const p2 = project(spineEnd.x, spineEnd.y, spineEnd.z, rotationY, rotationX, scale);

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // Spine tip glow
        const gradient = ctx.createRadialGradient(p2.x, p2.y, 0, p2.x, p2.y, 5);
        gradient.addColorStop(0, `hsla(${hue + 30}, 80%, 70%, ${brightness})`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p2.x, p2.y, 5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw connecting struts
      ctx.strokeStyle = `hsla(${hue}, 50%, 40%, ${brightness * 0.4})`;
      ctx.lineWidth = 0.5;
      icosaVertices.forEach((v) => {
        const inner = {
          x: v.x * innerScale,
          y: v.y * innerScale,
          z: v.z * innerScale
        };
        const p1 = project(v.x, v.y, v.z, rotationY, rotationX, scale);
        const p2 = project(inner.x, inner.y, inner.z, rotationY, rotationX, scale);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });

      drawRipples(ctx);
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
  }, [currentMode, hue, getBreathPhase, drawRipples]);

  // ========== NEURAL NETWORK MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'neuralNetwork' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    // Create nodes using 3D positions
    const nodes = [];
    const nodeCount = 80;
    const radius = 200;

    for (let i = 0; i < nodeCount; i++) {
      // Poisson disk-like distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * Math.cbrt(Math.random());

      nodes.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
        activation: 0,
        connections: []
      });
    }

    // Create connections between nearby nodes
    const connectionDist = 120;
    nodes.forEach((node, i) => {
      nodes.forEach((other, j) => {
        if (i < j) {
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dz = node.z - other.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (dist < connectionDist) {
            node.connections.push(j);
            other.connections.push(i);
          }
        }
      });
    });

    // Signals traveling along connections
    const signals = [];

    let rotationY = 0;

    const project = (x, y, z, rotY) => {
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      const perspective = 500 / (500 + z1);
      return {
        x: canvas.width / 2 + x1 * perspective,
        y: canvas.height / 2 + y * perspective,
        z: z1
      };
    };

    const triggerSignal = (fromNode) => {
      if (nodes[fromNode].connections.length > 0) {
        const toNode = nodes[fromNode].connections[Math.floor(Math.random() * nodes[fromNode].connections.length)];
        signals.push({
          from: fromNode,
          to: toNode,
          progress: 0,
          speed: 0.02 + Math.random() * 0.02
        });
      }
    };

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = (Date.now() - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      rotationY += 0.001;

      // Spawn random signals based on breath
      const signalRate = 0.02 + breath * 0.08;
      if (Math.random() < signalRate && signals.length < 50) {
        triggerSignal(Math.floor(Math.random() * nodeCount));
      }

      // Mouse interaction - activate nodes near cursor
      touchPointsRef.current.forEach(point => {
        if (point.active) {
          const mouseX = point.x - canvas.width / 2;
          const mouseY = point.y - canvas.height / 2;

          nodes.forEach((node, idx) => {
            const p = project(node.x, node.y, node.z, rotationY);
            const dx = p.x - point.x;
            const dy = p.y - point.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 80) {
              node.activation = Math.min(1, node.activation + 0.1);
              if (Math.random() < 0.1) triggerSignal(idx);
            }
          });
        }
      });

      const brightness = 0.3 + breath * 0.7;

      // Draw connections
      ctx.strokeStyle = `hsla(${hue}, 40%, 25%, ${brightness * 0.3})`;
      ctx.lineWidth = 0.5;
      nodes.forEach((node, i) => {
        const p1 = project(node.x, node.y, node.z, rotationY);
        node.connections.forEach(j => {
          if (i < j) {
            const p2 = project(nodes[j].x, nodes[j].y, nodes[j].z, rotationY);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });

      // Update and draw signals
      signals.forEach((signal, idx) => {
        signal.progress += signal.speed * (0.5 + breath);

        if (signal.progress >= 1) {
          nodes[signal.to].activation = Math.min(1, nodes[signal.to].activation + 0.5);
          // Propagate to random next node
          if (Math.random() < 0.7) {
            triggerSignal(signal.to);
          }
          signals.splice(idx, 1);
          return;
        }

        const from = nodes[signal.from];
        const to = nodes[signal.to];
        const x = from.x + (to.x - from.x) * signal.progress;
        const y = from.y + (to.y - from.y) * signal.progress;
        const z = from.z + (to.z - from.z) * signal.progress;
        const p = project(x, y, z, rotationY);

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 8);
        gradient.addColorStop(0, `hsla(${hue}, 70%, 60%, 0.9)`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw and update nodes
      nodes.forEach((node) => {
        node.activation *= 0.97;
        const p = project(node.x, node.y, node.z, rotationY);

        const nodeColor = node.activation > 0.3
          ? `hsla(${hue + 20}, 80%, 70%, ${0.5 + node.activation * 0.5})`
          : `hsla(${hue + 20}, 50%, 45%, ${brightness * 0.6})`;

        ctx.fillStyle = nodeColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 + node.activation * 3, 0, Math.PI * 2);
        ctx.fill();
      });

      drawRipples(ctx);
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
  }, [currentMode, hue, getBreathPhase, drawRipples]);

  // ========== LORENZ ATTRACTOR MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'lorenz' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    // Lorenz system parameters
    const sigma = 10;
    const rho = 28;
    const beta = 8 / 3;
    const dt = 0.005;

    // Multiple particles tracing the attractor
    const particles = [];
    const trailLength = 500;

    for (let i = 0; i < 5; i++) {
      particles.push({
        x: 0.1 + Math.random() * 0.1,
        y: 0,
        z: 0,
        trail: []
      });
    }

    let rotationY = 0;
    let rotationX = 0.3;

    const project = (x, y, z, rotY, rotX, scale = 5) => {
      x *= scale;
      y *= scale;
      z *= scale;
      z -= 130; // Center the attractor

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y1 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      const perspective = 500 / (500 + z2);
      return {
        x: canvas.width / 2 + x1 * perspective,
        y: canvas.height / 2 + y1 * perspective,
        z: z2
      };
    };

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = (Date.now() - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      rotationY += 0.001;

      // Mouse interaction
      touchPointsRef.current.forEach(point => {
        if (point.active) {
          rotationX = (point.y / canvas.height - 0.5) * 1.5;
        }
      });

      const speed = 0.5 + breath * 1.5;
      const brightness = 0.3 + breath * 0.7;

      // Update particles using Lorenz equations
      particles.forEach((particle, pIdx) => {
        for (let i = 0; i < Math.floor(5 * speed); i++) {
          const dx = sigma * (particle.y - particle.x) * dt;
          const dy = (particle.x * (rho - particle.z) - particle.y) * dt;
          const dz = (particle.x * particle.y - beta * particle.z) * dt;

          particle.x += dx;
          particle.y += dy;
          particle.z += dz;

          particle.trail.push({ x: particle.x, y: particle.y, z: particle.z });
          if (particle.trail.length > trailLength) {
            particle.trail.shift();
          }
        }

        // Draw trail with gradient
        if (particle.trail.length > 1) {
          for (let i = 1; i < particle.trail.length; i++) {
            const t = i / particle.trail.length;
            const p1 = project(particle.trail[i - 1].x, particle.trail[i - 1].y, particle.trail[i - 1].z, rotationY, rotationX);
            const p2 = project(particle.trail[i].x, particle.trail[i].y, particle.trail[i].z, rotationY, rotationX);

            ctx.strokeStyle = `hsla(${hue + pIdx * 10}, 70%, ${40 + t * 30}%, ${t * brightness})`;
            ctx.lineWidth = 0.5 + t * 1.5;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }

          // Particle head glow
          const head = particle.trail[particle.trail.length - 1];
          const p = project(head.x, head.y, head.z, rotationY, rotationX);
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 10);
          gradient.addColorStop(0, `hsla(${hue + 20}, 80%, 70%, ${brightness})`);
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      drawRipples(ctx);
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
  }, [currentMode, hue, getBreathPhase, drawRipples]);

  // ========== RÖSSLER ATTRACTOR MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'rossler' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    // Rössler system parameters
    const a = 0.2;
    const b = 0.2;
    const c = 5.7;
    const dt = 0.02;

    const particle = {
      x: 1,
      y: 1,
      z: 1,
      trail: []
    };
    const trailLength = 800;

    let rotationY = 0;
    let rotationX = 0.5;

    const project = (x, y, z, rotY, rotX, scale = 12) => {
      x *= scale;
      y *= scale;
      z *= scale;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y1 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      const perspective = 500 / (500 + z2);
      return {
        x: canvas.width / 2 + x1 * perspective,
        y: canvas.height / 2 + y1 * perspective,
        z: z2
      };
    };

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = (Date.now() - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      rotationY += 0.0015;

      // Mouse interaction
      touchPointsRef.current.forEach(point => {
        if (point.active) {
          rotationX = (point.y / canvas.height - 0.5) * 2;
        }
      });

      const speed = 0.5 + breath * 1;
      const brightness = 0.4 + breath * 0.6;

      // Update particle using Rössler equations
      for (let i = 0; i < Math.floor(3 * speed); i++) {
        const dx = (-particle.y - particle.z) * dt;
        const dy = (particle.x + a * particle.y) * dt;
        const dz = (b + particle.z * (particle.x - c)) * dt;

        particle.x += dx;
        particle.y += dy;
        particle.z += dz;

        particle.trail.push({ x: particle.x, y: particle.y, z: particle.z });
        if (particle.trail.length > trailLength) {
          particle.trail.shift();
        }
      }

      // Draw trail as ribbon
      if (particle.trail.length > 2) {
        for (let i = 2; i < particle.trail.length; i++) {
          const t = i / particle.trail.length;
          const p1 = project(particle.trail[i - 1].x, particle.trail[i - 1].y, particle.trail[i - 1].z, rotationY, rotationX);
          const p2 = project(particle.trail[i].x, particle.trail[i].y, particle.trail[i].z, rotationY, rotationX);

          const ribbonWidth = (1 + breath * 2) * t;
          ctx.strokeStyle = `hsla(${hue}, 70%, ${45 + t * 25}%, ${t * brightness})`;
          ctx.lineWidth = ribbonWidth;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }

        // Head glow
        const head = particle.trail[particle.trail.length - 1];
        const p = project(head.x, head.y, head.z, rotationY, rotationX);
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 15);
        gradient.addColorStop(0, `hsla(${hue + 20}, 80%, 70%, ${brightness})`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 15, 0, Math.PI * 2);
        ctx.fill();
      }

      drawRipples(ctx);
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
  }, [currentMode, hue, getBreathPhase, drawRipples]);

  // ========== FERROFLUID MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'ferrofluid' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    // Particles
    const particles = [];
    const particleCount = 800;
    const boundRadius = 150;

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = boundRadius * Math.cbrt(Math.random());

      particles.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
        vx: 0,
        vy: 0,
        vz: 0
      });
    }

    // Magnet position (orbits slowly)
    let magnetAngle = 0;
    let magnetStrength = 1;
    let mouseOverride = false;
    let mouseX = 0, mouseY = 0;

    const project = (x, y, z) => {
      const perspective = 400 / (400 + z);
      return {
        x: canvas.width / 2 + x * perspective,
        y: canvas.height / 2 + y * perspective,
        z: z
      };
    };

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = (Date.now() - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Magnet position
      magnetAngle += 0.01;
      let magnetX, magnetY, magnetZ;

      if (mouseOverride) {
        magnetX = (mouseX - canvas.width / 2) * 0.8;
        magnetY = (mouseY - canvas.height / 2) * 0.8;
        magnetZ = 100;
      } else {
        magnetX = Math.cos(magnetAngle) * 180;
        magnetY = Math.sin(magnetAngle * 0.7) * 100;
        magnetZ = Math.sin(magnetAngle * 0.5) * 80 + 100;
      }

      magnetStrength = 0.5 + breath * 1.5;
      const brightness = 0.4 + breath * 0.6;

      // Mouse interaction
      mouseOverride = false;
      touchPointsRef.current.forEach(point => {
        if (point.active) {
          mouseOverride = true;
          mouseX = point.x;
          mouseY = point.y;
        }
      });

      // Update particles
      particles.forEach(p => {
        // Attraction to magnet
        const dx = magnetX - p.x;
        const dy = magnetY - p.y;
        const dz = magnetZ - p.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) + 1;

        const force = magnetStrength * 50 / (dist * dist);
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
        p.vz += (dz / dist) * force;

        // Repulsion from other particles (simplified - use spatial hash in production)
        // For performance, only check nearby particles randomly
        for (let i = 0; i < 5; i++) {
          const other = particles[Math.floor(Math.random() * particleCount)];
          if (other === p) continue;
          const odx = p.x - other.x;
          const ody = p.y - other.y;
          const odz = p.z - other.z;
          const odist = Math.sqrt(odx * odx + ody * ody + odz * odz) + 1;
          if (odist < 20) {
            const repel = 2 / (odist * odist);
            p.vx += (odx / odist) * repel;
            p.vy += (ody / odist) * repel;
            p.vz += (odz / odist) * repel;
          }
        }

        // Damping
        p.vx *= 0.92;
        p.vy *= 0.92;
        p.vz *= 0.92;

        // Apply velocity
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Soft boundary
        const r = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
        if (r > boundRadius * 1.5) {
          const scale = boundRadius * 1.5 / r;
          p.x *= scale;
          p.y *= scale;
          p.z *= scale;
        }
      });

      // Sort particles by z for proper rendering
      particles.sort((a, b) => a.z - b.z);

      // Draw particles
      particles.forEach(p => {
        const proj = project(p.x, p.y, p.z);
        const size = 2 + (p.z + 200) / 200 * 2;

        // Spike detection (particles forming toward magnet)
        const dx = magnetX - p.x;
        const dy = magnetY - p.y;
        const dz = magnetZ - p.z;
        const toMagnet = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const isSpike = toMagnet < 100;

        const color = isSpike
          ? `hsla(${hue + 20}, 80%, 70%, ${brightness})`
          : `hsla(${hue}, 70%, ${50 + (p.z + 150) / 300 * 20}%, ${brightness * 0.8})`;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      drawRipples(ctx);
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
  }, [currentMode, hue, getBreathPhase, drawRipples]);

  // ========== MURMURATION MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'murmuration' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    // Boids
    const boids = [];
    const boidCount = 500;
    const bounds = { x: 300, y: 200, z: 200 };

    for (let i = 0; i < boidCount; i++) {
      boids.push({
        x: (Math.random() - 0.5) * bounds.x * 2,
        y: (Math.random() - 0.5) * bounds.y * 2,
        z: (Math.random() - 0.5) * bounds.z * 2,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        vz: (Math.random() - 0.5) * 2
      });
    }

    let predatorX = 0, predatorY = 0;
    let predatorActive = false;
    let rotationY = 0;

    const project = (x, y, z, rotY) => {
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      const perspective = 600 / (600 + z1);
      return {
        x: canvas.width / 2 + x1 * perspective,
        y: canvas.height / 2 + y * perspective,
        z: z1
      };
    };

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = (Date.now() - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      rotationY += 0.0005;

      // Boid parameters affected by breath
      const separation = 25;
      const alignment = 50;
      const cohesion = 80 * (0.7 + breath * 0.6);
      const maxSpeed = 3 + breath * 2;
      const brightness = 0.4 + breath * 0.6;

      // Mouse interaction (predator)
      predatorActive = false;
      touchPointsRef.current.forEach(point => {
        if (point.active) {
          predatorActive = true;
          predatorX = point.x;
          predatorY = point.y;
        }
      });

      // Update boids
      boids.forEach((boid, i) => {
        let sepX = 0, sepY = 0, sepZ = 0;
        let aliX = 0, aliY = 0, aliZ = 0;
        let cohX = 0, cohY = 0, cohZ = 0;
        let neighbors = 0;

        boids.forEach((other, j) => {
          if (i === j) return;
          const dx = other.x - boid.x;
          const dy = other.y - boid.y;
          const dz = other.z - boid.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < separation) {
            sepX -= dx / dist;
            sepY -= dy / dist;
            sepZ -= dz / dist;
          }

          if (dist < alignment) {
            aliX += other.vx;
            aliY += other.vy;
            aliZ += other.vz;
            neighbors++;
          }

          if (dist < cohesion) {
            cohX += other.x;
            cohY += other.y;
            cohZ += other.z;
          }
        });

        if (neighbors > 0) {
          aliX /= neighbors;
          aliY /= neighbors;
          aliZ /= neighbors;
          cohX = cohX / neighbors - boid.x;
          cohY = cohY / neighbors - boid.y;
          cohZ = cohZ / neighbors - boid.z;
        }

        // Apply forces
        boid.vx += sepX * 0.05 + aliX * 0.02 + cohX * 0.01;
        boid.vy += sepY * 0.05 + aliY * 0.02 + cohY * 0.01;
        boid.vz += sepZ * 0.05 + aliZ * 0.02 + cohZ * 0.01;

        // Flee from predator
        if (predatorActive) {
          const p = project(boid.x, boid.y, boid.z, rotationY);
          const dx = p.x - predatorX;
          const dy = p.y - predatorY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            boid.vx += dx * 0.01;
            boid.vy += dy * 0.01;
          }
        }

        // Bound
        if (Math.abs(boid.x) > bounds.x) boid.vx -= Math.sign(boid.x) * 0.5;
        if (Math.abs(boid.y) > bounds.y) boid.vy -= Math.sign(boid.y) * 0.5;
        if (Math.abs(boid.z) > bounds.z) boid.vz -= Math.sign(boid.z) * 0.5;

        // Limit speed
        const speed = Math.sqrt(boid.vx * boid.vx + boid.vy * boid.vy + boid.vz * boid.vz);
        if (speed > maxSpeed) {
          boid.vx = (boid.vx / speed) * maxSpeed;
          boid.vy = (boid.vy / speed) * maxSpeed;
          boid.vz = (boid.vz / speed) * maxSpeed;
        }

        boid.x += boid.vx;
        boid.y += boid.vy;
        boid.z += boid.vz;
      });

      // Sort and draw
      boids.sort((a, b) => a.z - b.z);

      boids.forEach(boid => {
        const p = project(boid.x, boid.y, boid.z, rotationY);
        const size = 1.5 + (boid.z + bounds.z) / (bounds.z * 2) * 2;

        // Draw boid as small triangle pointing in velocity direction
        const angle = Math.atan2(boid.vy, boid.vx);
        ctx.fillStyle = `hsla(${hue}, 70%, ${55 + (boid.z + bounds.z) / (bounds.z * 2) * 20}%, ${brightness})`;
        ctx.beginPath();
        ctx.moveTo(p.x + Math.cos(angle) * size * 2, p.y + Math.sin(angle) * size * 2);
        ctx.lineTo(p.x + Math.cos(angle + 2.5) * size, p.y + Math.sin(angle + 2.5) * size);
        ctx.lineTo(p.x + Math.cos(angle - 2.5) * size, p.y + Math.sin(angle - 2.5) * size);
        ctx.closePath();
        ctx.fill();
      });

      drawRipples(ctx);
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
  }, [currentMode, hue, getBreathPhase, drawRipples]);

  // ========== MORPHING PLATONIC SOLIDS MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'morphingSolids' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    // Platonic solid vertices (normalized)
    const phi = (1 + Math.sqrt(5)) / 2;

    const solids = {
      tetrahedron: [
        [1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]
      ].map(v => ({ x: v[0] * 80, y: v[1] * 80, z: v[2] * 80 })),

      cube: [
        [-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1],
        [1, -1, -1], [1, -1, 1], [1, 1, -1], [1, 1, 1]
      ].map(v => ({ x: v[0] * 70, y: v[1] * 70, z: v[2] * 70 })),

      octahedron: [
        [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]
      ].map(v => ({ x: v[0] * 100, y: v[1] * 100, z: v[2] * 100 })),

      icosahedron: [
        [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
        [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
        [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
      ].map(v => ({ x: v[0] * 60, y: v[1] * 60, z: v[2] * 60 }))
    };

    const solidNames = ['tetrahedron', 'cube', 'octahedron', 'icosahedron'];
    let currentSolid = 0;
    let morphProgress = 0;
    let rotationY = 0;
    let rotationX = 0.4;

    const project = (x, y, z, rotY, rotX, scale = 1) => {
      x *= scale;
      y *= scale;
      z *= scale;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y1 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      const perspective = 500 / (500 + z2);
      return {
        x: canvas.width / 2 + x1 * perspective,
        y: canvas.height / 2 + y1 * perspective,
        z: z2
      };
    };

    const lerp = (a, b, t) => a + (b - a) * t;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = (Date.now() - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      rotationY += 0.005;

      // Morph during exhale
      if (breath < 0.3) {
        morphProgress += 0.01;
        if (morphProgress >= 1) {
          morphProgress = 0;
          currentSolid = (currentSolid + 1) % solidNames.length;
        }
      }

      // Mouse interaction
      touchPointsRef.current.forEach(point => {
        if (point.active) {
          rotationX = (point.y / canvas.height - 0.5) * 2;
        }
      });

      const scale = 1 + breath * 0.15;
      const brightness = 0.4 + breath * 0.6;

      const fromSolid = solids[solidNames[currentSolid]];
      const toSolid = solids[solidNames[(currentSolid + 1) % solidNames.length]];

      // Create interpolated vertices
      const maxVerts = Math.max(fromSolid.length, toSolid.length);
      const vertices = [];

      for (let i = 0; i < maxVerts; i++) {
        const fromV = fromSolid[i % fromSolid.length];
        const toV = toSolid[i % toSolid.length];
        vertices.push({
          x: lerp(fromV.x, toV.x, morphProgress),
          y: lerp(fromV.y, toV.y, morphProgress),
          z: lerp(fromV.z, toV.z, morphProgress)
        });
      }

      // Draw edges (connect all vertices for simplicity)
      ctx.strokeStyle = `hsla(${hue}, 70%, ${55 + breath * 15}%, ${brightness})`;
      ctx.lineWidth = 1.5;

      for (let i = 0; i < vertices.length; i++) {
        for (let j = i + 1; j < vertices.length; j++) {
          const v1 = vertices[i];
          const v2 = vertices[j];
          const dist = Math.sqrt(
            (v1.x - v2.x) ** 2 + (v1.y - v2.y) ** 2 + (v1.z - v2.z) ** 2
          );
          if (dist < 160) { // Only draw nearby edges
            const p1 = project(v1.x, v1.y, v1.z, rotationY, rotationX, scale);
            const p2 = project(v2.x, v2.y, v2.z, rotationY, rotationX, scale);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw vertices with glow
      vertices.forEach(v => {
        const p = project(v.x, v.y, v.z, rotationY, rotationX, scale);
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 8);
        gradient.addColorStop(0, `hsla(${hue + 20}, 80%, 70%, ${brightness})`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
        ctx.fill();
      });

      drawRipples(ctx);
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
  }, [currentMode, hue, getBreathPhase, drawRipples]);

  // ========== NESTED PLATONIC SOLIDS MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'nestedSolids' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    const phi = (1 + Math.sqrt(5)) / 2;

    // Three nested solids
    const icosahedron = [
      [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
      [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
      [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
    ];

    const octahedron = [
      [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]
    ];

    const tetrahedron = [
      [1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]
    ];

    const icosaEdges = [
      [0,1], [0,5], [0,7], [0,10], [0,11], [1,5], [1,7], [1,8], [1,9],
      [2,3], [2,4], [2,6], [2,10], [2,11], [3,4], [3,6], [3,8], [3,9],
      [4,5], [4,9], [4,11], [5,9], [5,11], [6,7], [6,8], [6,10], [7,8], [7,10], [8,9], [10,11]
    ];

    const octaEdges = [[0,2],[0,3],[0,4],[0,5],[1,2],[1,3],[1,4],[1,5],[2,4],[2,5],[3,4],[3,5]];
    const tetraEdges = [[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]];

    let rotations = [
      { y: 0, x: 0, speed: 0.003 },
      { y: 0, x: 0, speed: -0.005 },
      { y: 0, x: 0, speed: 0.007 }
    ];

    const project = (vertex, scale, rotY, rotX) => {
      let x = vertex[0] * scale;
      let y = vertex[1] * scale;
      let z = vertex[2] * scale;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y1 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      const perspective = 500 / (500 + z2);
      return {
        x: canvas.width / 2 + x1 * perspective,
        y: canvas.height / 2 + y1 * perspective
      };
    };

    const drawSolid = (vertices, edges, scale, rotation, color, lineWidth) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      edges.forEach(([i, j]) => {
        const p1 = project(vertices[i], scale, rotation.y, rotation.x);
        const p2 = project(vertices[j], scale, rotation.y, rotation.x);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });

      // Vertex dots
      vertices.forEach(v => {
        const p = project(v, scale, rotation.y, rotation.x);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = (Date.now() - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const scale = 1 + breath * 0.15;
      const brightness = 0.4 + breath * 0.6;
      const speedMult = 0.5 + breath * 0.5;

      // Update rotations
      rotations[0].y += rotations[0].speed * speedMult;
      rotations[1].y += rotations[1].speed * speedMult;
      rotations[1].x += rotations[1].speed * 0.7 * speedMult;
      rotations[2].y += rotations[2].speed * speedMult;
      rotations[2].x = Math.PI / 4 + Math.sin(elapsed * 0.5) * 0.2;

      // Mouse interaction - tilt all solids
      touchPointsRef.current.forEach(point => {
        if (point.active) {
          const tiltX = (point.y / canvas.height - 0.5) * 0.3;
          const tiltY = (point.x / canvas.width - 0.5) * 0.3;
          rotations.forEach(r => {
            r.x += tiltX * 0.02;
            r.y += tiltY * 0.02;
          });
        }
      });

      // Draw from outer to inner
      drawSolid(icosahedron, icosaEdges, 120 * scale, rotations[0],
        `hsla(${hue}, 70%, ${55 + breath * 15}%, ${brightness})`, 1.5);

      drawSolid(octahedron, octaEdges, 80 * scale, rotations[1],
        `hsla(${hue + 20}, 60%, 45%, ${brightness * 0.8})`, 1.5);

      drawSolid(tetrahedron, tetraEdges, 50 * scale, rotations[2],
        `hsla(${hue + 30}, 80%, 70%, ${brightness})`, 2);

      drawRipples(ctx);
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
  }, [currentMode, hue, getBreathPhase, drawRipples]);

  // ========== FLOWER OF LIFE MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'flowerOfLife' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    // Generate flower of life circles
    const circles = [];
    const radius = Math.min(canvas.width, canvas.height) * 0.08;

    // Center circle
    circles.push({ x: 0, y: 0, delay: 0 });

    // First ring (6 circles)
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      circles.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        delay: 1
      });
    }

    // Second ring (12 circles)
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      // Outer circles
      circles.push({
        x: Math.cos(angle) * radius * 2,
        y: Math.sin(angle) * radius * 2,
        delay: 2
      });
      // Between circles
      const betweenAngle = angle + Math.PI / 6;
      circles.push({
        x: Math.cos(betweenAngle) * radius * Math.sqrt(3),
        y: Math.sin(betweenAngle) * radius * Math.sqrt(3),
        delay: 2
      });
    }

    let drawProgress = 0;
    let rotationZ = 0;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = (Date.now() - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawProgress += 0.02;
      rotationZ += 0.001;

      const scale = 1 + breath * 0.1;
      const brightness = 0.4 + breath * 0.6;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Mouse interaction - highlight nearest circle
      let highlightIdx = -1;
      let minDist = Infinity;
      touchPointsRef.current.forEach(point => {
        if (point.active) {
          circles.forEach((circle, idx) => {
            const cx = centerX + circle.x * scale * Math.cos(rotationZ) - circle.y * scale * Math.sin(rotationZ);
            const cy = centerY + circle.x * scale * Math.sin(rotationZ) + circle.y * scale * Math.cos(rotationZ);
            const dist = Math.sqrt((point.x - cx) ** 2 + (point.y - cy) ** 2);
            if (dist < minDist) {
              minDist = dist;
              highlightIdx = idx;
            }
          });
        }
      });

      // Draw circles
      circles.forEach((circle, idx) => {
        const progress = Math.max(0, Math.min(1, drawProgress - circle.delay));
        if (progress <= 0) return;

        const cx = centerX + circle.x * scale * Math.cos(rotationZ) - circle.y * scale * Math.sin(rotationZ);
        const cy = centerY + circle.x * scale * Math.sin(rotationZ) + circle.y * scale * Math.cos(rotationZ);

        const isHighlight = idx === highlightIdx;
        const circleRadius = radius * scale * (isHighlight ? 1.05 : 1);

        ctx.strokeStyle = isHighlight
          ? `hsla(${hue + 20}, 80%, 70%, ${brightness})`
          : `hsla(${hue}, 70%, ${55 + breath * 15}%, ${brightness * 0.8})`;
        ctx.lineWidth = isHighlight ? 2.5 : 1.5;

        ctx.beginPath();
        ctx.arc(cx, cy, circleRadius, 0, Math.PI * 2 * progress);
        ctx.stroke();

        // Center glow
        if (progress >= 1) {
          const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, circleRadius * 0.3);
          gradient.addColorStop(0, `hsla(${hue}, 60%, 60%, ${brightness * 0.2 * (1 + Math.sin(elapsed * 2 + idx))})`);
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(cx, cy, circleRadius * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      drawRipples(ctx);
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
  }, [currentMode, hue, getBreathPhase, drawRipples]);

  // ========== SRI YANTRA MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'sriYantra' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    const size = Math.min(canvas.width, canvas.height) * 0.35;
    let drawProgress = 0;
    let binduPulse = 0;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = (Date.now() - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawProgress = Math.min(1, drawProgress + 0.005);
      binduPulse = 0.8 + Math.sin(elapsed * 2) * 0.2;

      const scale = 1 + breath * 0.08;
      const brightness = 0.4 + breath * 0.6;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(scale, scale);

      // Outer square (Bhupura)
      if (drawProgress > 0.9) {
        ctx.strokeStyle = `hsla(${hue + 20}, 50%, 40%, ${brightness * 0.6})`;
        ctx.lineWidth = 2;
        const squareSize = size * 1.1;
        ctx.strokeRect(-squareSize, -squareSize, squareSize * 2, squareSize * 2);

        // Gates
        const gateSize = size * 0.15;
        [0, Math.PI/2, Math.PI, -Math.PI/2].forEach(angle => {
          ctx.save();
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.moveTo(-gateSize, -squareSize);
          ctx.lineTo(0, -squareSize - gateSize * 0.5);
          ctx.lineTo(gateSize, -squareSize);
          ctx.stroke();
          ctx.restore();
        });
      }

      // Outer circles (lotus petals simplified as circles)
      if (drawProgress > 0.8) {
        ctx.strokeStyle = `hsla(${hue}, 60%, 50%, ${brightness * 0.5})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.95, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.85, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Nine interlocking triangles (simplified representation)
      const triangles = [
        // Upward triangles (Shiva)
        { points: [[0, -size * 0.7], [-size * 0.6, size * 0.5], [size * 0.6, size * 0.5]], up: true },
        { points: [[0, -size * 0.5], [-size * 0.45, size * 0.35], [size * 0.45, size * 0.35]], up: true },
        { points: [[0, -size * 0.3], [-size * 0.3, size * 0.2], [size * 0.3, size * 0.2]], up: true },
        { points: [[0, -size * 0.15], [-size * 0.15, size * 0.1], [size * 0.15, size * 0.1]], up: true },
        // Downward triangles (Shakti)
        { points: [[0, size * 0.65], [-size * 0.55, -size * 0.4], [size * 0.55, -size * 0.4]], up: false },
        { points: [[0, size * 0.45], [-size * 0.4, -size * 0.25], [size * 0.4, -size * 0.25]], up: false },
        { points: [[0, size * 0.3], [-size * 0.28, -size * 0.15], [size * 0.28, -size * 0.15]], up: false },
        { points: [[0, size * 0.18], [-size * 0.18, -size * 0.08], [size * 0.18, -size * 0.08]], up: false },
        { points: [[0, size * 0.08], [-size * 0.08, -size * 0.03], [size * 0.08, -size * 0.03]], up: false },
      ];

      triangles.forEach((tri, idx) => {
        const triProgress = Math.max(0, Math.min(1, drawProgress * 10 - idx * 0.8));
        if (triProgress <= 0) return;

        ctx.strokeStyle = tri.up
          ? `hsla(${hue}, 70%, ${55 + breath * 15}%, ${brightness * triProgress})`
          : `hsla(${hue + 20}, 60%, 50%, ${brightness * triProgress})`;
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.moveTo(tri.points[0][0], tri.points[0][1]);
        for (let i = 1; i <= 3; i++) {
          const pt = tri.points[i % 3];
          const progress = Math.min(1, triProgress * 3 - (i - 1));
          if (progress > 0) {
            const prev = tri.points[(i - 1) % 3];
            ctx.lineTo(
              prev[0] + (pt[0] - prev[0]) * progress,
              prev[1] + (pt[1] - prev[1]) * progress
            );
          }
        }
        ctx.stroke();
      });

      // Central bindu
      const binduSize = 5 * binduPulse * (0.8 + breath * 0.4);
      const binduGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, binduSize * 3);
      binduGradient.addColorStop(0, `hsla(${hue + 20}, 80%, 70%, ${brightness})`);
      binduGradient.addColorStop(0.5, `hsla(${hue + 20}, 80%, 60%, ${brightness * 0.5})`);
      binduGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = binduGradient;
      ctx.beginPath();
      ctx.arc(0, 0, binduSize * 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `hsla(${hue + 20}, 80%, 70%, 1)`;
      ctx.beginPath();
      ctx.arc(0, 0, binduSize, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      drawRipples(ctx);
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
  }, [currentMode, hue, getBreathPhase, drawRipples]);

  // ========== BREATHING SPHERE MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'breathingSphere' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    // Icosahedron subdivided - create sphere mesh
    const phi = (1 + Math.sqrt(5)) / 2;
    let vertices = [
      [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
      [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
      [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
    ].map(v => {
      const len = Math.sqrt(v[0]**2 + v[1]**2 + v[2]**2);
      return { x: v[0]/len * 120, y: v[1]/len * 120, z: v[2]/len * 120, ox: v[0]/len, oy: v[1]/len, oz: v[2]/len };
    });

    const faces = [
      [0,11,5], [0,5,1], [0,1,7], [0,7,10], [0,10,11],
      [1,5,9], [5,11,4], [11,10,2], [10,7,6], [7,1,8],
      [3,9,4], [3,4,2], [3,2,6], [3,6,8], [3,8,9],
      [4,9,5], [2,4,11], [6,2,10], [8,6,7], [9,8,1]
    ];

    // Subdivide once
    const midpoint = (v1, v2) => {
      const mx = (v1.x + v2.x) / 2;
      const my = (v1.y + v2.y) / 2;
      const mz = (v1.z + v2.z) / 2;
      const len = Math.sqrt(mx**2 + my**2 + mz**2);
      return {
        x: mx/len * 120, y: my/len * 120, z: mz/len * 120,
        ox: mx/len, oy: my/len, oz: mz/len
      };
    };

    const edgeMap = new Map();
    const newFaces = [];

    faces.forEach(face => {
      const [a, b, c] = face;
      const getEdgeMid = (i, j) => {
        const key = [Math.min(i,j), Math.max(i,j)].join(',');
        if (!edgeMap.has(key)) {
          edgeMap.set(key, vertices.length);
          vertices.push(midpoint(vertices[i], vertices[j]));
        }
        return edgeMap.get(key);
      };

      const ab = getEdgeMid(a, b);
      const bc = getEdgeMid(b, c);
      const ca = getEdgeMid(c, a);

      newFaces.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
    });

    // Build edges from faces
    const edges = new Set();
    newFaces.forEach(face => {
      edges.add([Math.min(face[0], face[1]), Math.max(face[0], face[1])].join(','));
      edges.add([Math.min(face[1], face[2]), Math.max(face[1], face[2])].join(','));
      edges.add([Math.min(face[2], face[0]), Math.max(face[2], face[0])].join(','));
    });
    const edgeList = Array.from(edges).map(e => e.split(',').map(Number));

    let rotationY = 0;
    let rotationX = 0.3;
    let noiseOffset = 0;

    // Simple noise function
    const noise = (x, y, z, t) => {
      return Math.sin(x * 2 + t) * Math.cos(y * 2 + t * 0.7) * Math.sin(z * 2 + t * 0.5) * 0.5 +
             Math.sin(x * 4 + t * 1.3) * Math.cos(y * 4 + t) * 0.25;
    };

    const project = (v, rotY, rotX, breath, t) => {
      // Apply noise displacement
      const displacement = noise(v.ox, v.oy, v.oz, t) * (0.1 + breath * 0.2);
      const scale = 1 + breath * 0.2 + displacement;

      let x = v.ox * 120 * scale;
      let y = v.oy * 120 * scale;
      let z = v.oz * 120 * scale;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y1 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      const perspective = 500 / (500 + z2);
      return {
        x: canvas.width / 2 + x1 * perspective,
        y: canvas.height / 2 + y1 * perspective,
        z: z2,
        displacement
      };
    };

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = (Date.now() - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      rotationY += 0.003;
      noiseOffset = elapsed * 0.5;

      // Mouse interaction
      touchPointsRef.current.forEach(point => {
        if (point.active) {
          rotationX = (point.y / canvas.height - 0.5) * 1.5;
        }
      });

      const brightness = 0.3 + breath * 0.7;

      // Project all vertices
      const projected = vertices.map(v => project(v, rotationY, rotationX, breath, noiseOffset));

      // Draw edges
      edgeList.forEach(([i, j]) => {
        const p1 = projected[i];
        const p2 = projected[j];

        // Color based on displacement
        const avgDisp = (p1.displacement + p2.displacement) / 2;
        const colorShift = avgDisp * 30;

        ctx.strokeStyle = `hsla(${hue + colorShift}, 70%, ${50 + avgDisp * 40}%, ${brightness * 0.8})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });

      drawRipples(ctx);
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
  }, [currentMode, hue, getBreathPhase, drawRipples]);

  // ========== INVERTING SPHERE MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'invertingSphere' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    // Create sphere vertices
    const latSteps = 20;
    const lonSteps = 30;
    const radius = 120;
    const vertices = [];

    for (let lat = 0; lat <= latSteps; lat++) {
      const theta = (lat / latSteps) * Math.PI;
      for (let lon = 0; lon <= lonSteps; lon++) {
        const phi = (lon / lonSteps) * Math.PI * 2;
        const x = Math.sin(theta) * Math.cos(phi);
        const y = Math.cos(theta);
        const z = Math.sin(theta) * Math.sin(phi);
        vertices.push({ x, y, z });
      }
    }

    let rotationY = 0;
    let inversionProgress = 0;
    let inversionDirection = 1;

    const project = (v, rotY, inversion) => {
      // Inversion: lerp from P to -P through complex intermediate
      const t = inversion;
      const easeT = t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;

      // Create interesting intermediate shape
      const warp = Math.sin(t * Math.PI) * 0.5;
      const twist = t * Math.PI * 2;

      let x = v.x * (1 - 2 * easeT);
      let y = v.y * (1 - 2 * easeT);
      let z = v.z * (1 - 2 * easeT);

      // Add twist during inversion
      const twistAngle = twist * v.y * warp;
      const cosT = Math.cos(twistAngle);
      const sinT = Math.sin(twistAngle);
      const tx = x * cosT - z * sinT;
      const tz = x * sinT + z * cosT;
      x = tx;
      z = tz;

      // Bulge during middle of inversion
      const bulge = 1 + warp * 0.5 * (1 - Math.abs(v.y));
      x *= bulge;
      z *= bulge;

      // Scale to radius
      x *= radius;
      y *= radius;
      z *= radius;

      // Rotation
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      const perspective = 500 / (500 + z1);
      return {
        x: canvas.width / 2 + x1 * perspective,
        y: canvas.height / 2 + y * perspective,
        z: z1
      };
    };

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = (Date.now() - startTime) / 1000;
      const breath = getBreathPhase(elapsed);

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      rotationY += 0.002;

      // Sync inversion to breath cycle
      inversionProgress = breath;

      // Mouse interaction - pause/adjust
      touchPointsRef.current.forEach(point => {
        if (point.active) {
          // Touch controls inversion directly
          inversionProgress = point.x / canvas.width;
        }
      });

      const brightness = 0.4 + Math.sin(inversionProgress * Math.PI) * 0.3 + 0.3;

      // Draw wireframe
      ctx.strokeStyle = `hsla(${hue}, 70%, ${55 + breath * 15}%, ${brightness})`;
      ctx.lineWidth = 1;

      // Draw latitude lines
      for (let lat = 0; lat <= latSteps; lat++) {
        ctx.beginPath();
        for (let lon = 0; lon <= lonSteps; lon++) {
          const idx = lat * (lonSteps + 1) + lon;
          const p = project(vertices[idx], rotationY, inversionProgress);
          if (lon === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      // Draw longitude lines
      for (let lon = 0; lon <= lonSteps; lon += 2) {
        ctx.beginPath();
        for (let lat = 0; lat <= latSteps; lat++) {
          const idx = lat * (lonSteps + 1) + lon;
          const p = project(vertices[idx], rotationY, inversionProgress);
          if (lat === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      // Interior glow during inversion
      if (inversionProgress > 0.2 && inversionProgress < 0.8) {
        const glowIntensity = Math.sin((inversionProgress - 0.2) / 0.6 * Math.PI);
        const gradient = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, 0,
          canvas.width / 2, canvas.height / 2, radius * 0.8
        );
        gradient.addColorStop(0, `hsla(${hue + 20}, 80%, 70%, ${glowIntensity * 0.4})`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

      drawRipples(ctx);
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
  }, [currentMode, hue, getBreathPhase, drawRipples]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: backgroundMode ? 0 : 2,
        cursor: backgroundMode ? 'default' : 'pointer',
        background: backgroundMode ? 'transparent' : '#000',
        touchAction: 'none',
        opacity: bgOpacity,
        pointerEvents: backgroundMode ? 'none' : 'auto',
        transition: 'opacity 1s ease',
      }}
      onMouseDown={backgroundMode ? undefined : handleInteractionStart}
      onMouseMove={backgroundMode ? undefined : handleInteractionMove}
      onMouseUp={backgroundMode ? undefined : handleInteractionEnd}
      onMouseLeave={backgroundMode ? undefined : handleInteractionEnd}
      onTouchStart={backgroundMode ? undefined : handleInteractionStart}
      onTouchMove={backgroundMode ? undefined : handleInteractionMove}
      onTouchEnd={backgroundMode ? undefined : handleInteractionEnd}
    >
      {/* Three.js container for 3D modes */}
      {(currentMode === 'geometry' || currentMode === 'jellyfish') && (
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      )}

      {/* Canvas for 2D modes */}
      {currentMode !== 'geometry' && currentMode !== 'jellyfish' && (
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      )}

      {/* Swipe hint at bottom - only show briefly on first load or after inactivity */}
      {!showUI && (
        <div style={{
          position: 'absolute',
          bottom: '1.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.3rem',
          opacity: 0.25,
          pointerEvents: 'none',
        }}>
          <div style={{
            width: '2px',
            height: '24px',
            background: `linear-gradient(to top, hsla(${hue}, 52%, 68%, 0.5), transparent)`,
            borderRadius: '1px',
          }} />
        </div>
      )}

      {/* Visual selector - bottom drawer */}
      {showUI && (
        <>
          {/* Backdrop - tap to close */}
          <div
            onClick={() => setShowUI(false)}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 10,
              animation: 'fadeIn 0.5s ease-out',
            }}
          />
          {/* Bottom drawer */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: '55vh',
            background: 'rgba(10,10,15,0.95)',
            borderRadius: '20px 20px 0 0',
            backdropFilter: 'blur(20px)',
            border: `1px solid hsla(${hue}, 52%, 68%, 0.12)`,
            borderBottom: 'none',
            zIndex: 11,
            animation: 'slideUpDrawer 0.5s ease-out',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Drawer handle */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '0.75rem',
              cursor: 'pointer',
            }} onClick={() => setShowUI(false)}>
              <div style={{
                width: '36px',
                height: '4px',
                background: `hsla(${hue}, 52%, 68%, 0.3)`,
                borderRadius: '2px',
              }} />
            </div>

            {/* Title */}
            <div style={{
              textAlign: 'center',
              padding: '0.75rem 1rem',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <span style={{
                color: `hsla(${hue}, 52%, 68%, 0.7)`,
                fontSize: '0.6rem',
                fontFamily: '"Jost", sans-serif',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}>Visuals</span>
            </div>

            {/* Scrollable list */}
            <div style={{
              overflowY: 'auto',
              padding: '0.5rem 0',
              WebkitOverflowScrolling: 'touch',
            }}>
              {gazeModes.map(mode => (
                <button
                  key={mode.key}
                  onClick={(e) => {
                    e.stopPropagation();
                    setTimeout(() => {
                      setCurrentMode(mode.key);
                      setShowUI(false);
                      setShowVisualToast(true);
                      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
                      toastTimeoutRef.current = setTimeout(() => setShowVisualToast(false), 1500);
                    }, 80);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    background: currentMode === mode.key ? `hsla(${hue}, 52%, 68%, 0.1)` : 'transparent',
                    border: 'none',
                    borderLeft: currentMode === mode.key ? `3px solid hsla(${hue}, 52%, 68%, 0.6)` : '3px solid transparent',
                    color: currentMode === mode.key ? `hsl(${hue}, 52%, 68%)` : 'rgba(255,255,255,0.6)',
                    padding: '0.85rem 1.5rem',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontFamily: '"Jost", sans-serif',
                    textAlign: 'left',
                    transition: 'all 0.4s ease',
                  }}
                >
                  {mode.name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
      <style>{`
        @keyframes slideUpDrawer {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
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
  primaryHue: 162,        // App color scheme (162 = teal)
};

// Color presets for the app
const COLOR_PRESETS = [
  { name: 'Teal', hue: 162, hex: '#7FDBCA' },
  { name: 'Ocean', hue: 195, hex: '#7FC8DB' },
  { name: 'Violet', hue: 270, hex: '#A87FDB' },
  { name: 'Rose', hue: 340, hex: '#DB7F9E' },
  { name: 'Sage', hue: 140, hex: '#7FDB9E' },
  { name: 'Amber', hue: 40, hex: '#DBC07F' },
];

const STORAGE_KEYS = {
  SAVED_QUOTES: 'still_saved_quotes',
  SETTINGS: 'still_settings',
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
    try { await navigator.share({ title: 'Wisdom from Still', text }); }
    catch (e) { if (e.name !== 'AbortError') navigator.clipboard.writeText(text); }
  } else { navigator.clipboard.writeText(text); }
};

// ============================================================================
// EASING FUNCTIONS
// ============================================================================

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

// ============================================================================
// BREATHWORK VIEW COMPONENT
// ============================================================================

function BreathworkView({ breathSession, breathTechniques, startBreathSession, stopBreathSession, primaryHue = 162, primaryColor = 'hsl(162, 52%, 68%)' }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const lungDataRef = useRef(null);
  const [showUI, setShowUI] = useState(false);
  const swipeStartRef = useRef(null);
  const wheelAccumRef = useRef(0);
  const wheelTimeoutRef = useRef(null);

  // Initialize lung capillaries data structure
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const centerX = canvas.width / 2;
    const startY = canvas.height * 0.18;

    // Colors - based on primaryHue
    const colorDeoxygenated = { h: primaryHue, s: 40, l: 32 };
    const colorOxygenated = { h: primaryHue, s: 66, l: 55 };
    const colorExhale = { h: primaryHue, s: 51, l: 45 };

    // Branch class for the bronchial tree
    class Branch {
      constructor(x1, y1, angle, length, depth, maxDepth, side, parent = null) {
        this.x1 = x1;
        this.y1 = y1;
        this.angle = angle;
        this.length = length;
        this.depth = depth;
        this.maxDepth = maxDepth;
        this.side = side;
        this.parent = parent;

        const curve = Math.sin(depth * 1.5) * 0.1;
        this.x2 = x1 + Math.cos(angle + curve) * length;
        this.y2 = y1 + Math.sin(angle + curve) * length;

        this.thickness = Math.max(1, 7 - depth * 0.85);
        this.fillProgress = 0;
        this.targetFillProgress = 0;
        this.fillDelay = depth * 0.15; // Depth delay per spec
        this.children = [];
        this.alveoli = null;

        // For gradient fill along branch
        this.fillPosition = 0; // 0-1 position of fill "wavefront"
        this.targetFillPosition = 0;
      }

      getPathDistance() {
        let dist = this.length;
        let current = this.parent;
        while (current) {
          dist += current.length;
          current = current.parent;
        }
        return dist;
      }

      // Normalized path distance (0-1 based on max)
      getNormalizedPathDistance(maxDist) {
        return this.getPathDistance() / maxDist;
      }
    }

    // Alveoli cluster class
    class AlveoliCluster {
      constructor(x, y, depth, side, parentBranch = null) {
        this.x = x;
        this.y = y;
        this.depth = depth;
        this.side = side;
        this.parentBranch = parentBranch;
        this.fillProgress = 0;
        this.targetFillProgress = 0;
        this.pulsePhase = Math.random() * Math.PI * 2;

        // Bloom effect state
        this.bloomIntensity = 0;
        this.bloomScale = 1;
        this.hasBloomedThisCycle = false;
        this.bloomStartTime = 0;

        this.spheres = [];
        const count = 4 + Math.floor(Math.random() * 4);
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
          const dist = 3 + Math.random() * 4;
          this.spheres.push({
            offsetX: Math.cos(angle) * dist,
            offsetY: Math.sin(angle) * dist,
            radius: 2 + Math.random() * 2.5,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }

      // Get fill timing based on parent branch path distance
      getArrivalTiming(maxDist) {
        if (this.parentBranch) {
          return this.parentBranch.getNormalizedPathDistance(maxDist);
        }
        return this.depth / 8; // Fallback to depth-based
      }
    }

    // Oxygen particle class
    class OxygenParticle {
      constructor(startX, startY, branch) {
        this.x = startX;
        this.y = startY;
        this.branch = branch;
        this.progress = 0;
        this.speed = 0.018 + Math.random() * 0.012;
        this.size = 1.2 + Math.random() * 1.2;
        this.alpha = 0.5 + Math.random() * 0.4;
        this.alive = true;
        this.direction = 1;
      }

      update(isInhaling) {
        this.direction = isInhaling ? 1 : -1;
        this.progress += this.speed * this.direction;

        if (this.progress >= 1 && this.direction === 1) {
          if (this.branch.children.length > 0) {
            this.branch = this.branch.children[Math.floor(Math.random() * this.branch.children.length)];
            this.progress = 0;
          } else {
            this.alive = false;
          }
        } else if (this.progress <= 0 && this.direction === -1) {
          if (this.branch.parent) {
            this.branch = this.branch.parent;
            this.progress = 1;
          } else {
            this.alive = false;
          }
        }

        const t = Math.max(0, Math.min(1, this.progress));
        this.x = this.branch.x1 + (this.branch.x2 - this.branch.x1) * t;
        this.y = this.branch.y1 + (this.branch.y2 - this.branch.y1) * t;
      }
    }

    // Generate the bronchial tree
    const allBranches = [];
    const allAlveoli = [];
    const particles = [];

    // Lung shape boundaries for constraining branches
    const lungScale = Math.min(canvas.width, canvas.height) * 0.01;

    const isInsideLung = (x, y, side) => {
      const relX = (x - centerX) / lungScale;
      const relY = (y - startY) / lungScale;

      if (side === 'right') {
        // Right lung shape (3 lobes, larger)
        const inUpperLobe = relX > 5 && relX < 110 && relY > 0 && relY < 90 &&
          relY < 90 - Math.pow(Math.max(0, relX - 80), 2) * 0.03;
        const inMiddleLobe = relX > 15 && relX < 100 && relY > 70 && relY < 150;
        const inLowerLobe = relX > 10 && relX < 95 && relY > 130 && relY < 220 &&
          relY < 220 - Math.pow(Math.max(0, relX - 60), 2) * 0.02;
        return inUpperLobe || inMiddleLobe || inLowerLobe;
      } else {
        // Left lung shape (2 lobes, smaller, with cardiac notch)
        const inUpperLobe = relX < -5 && relX > -95 && relY > 0 && relY < 100 &&
          relY < 100 - Math.pow(Math.max(0, -relX - 70), 2) * 0.03;
        const inLowerLobe = relX < -8 && relX > -85 && relY > 80 && relY < 210 &&
          !(relX > -50 && relY > 140 && relY < 190); // Cardiac notch
        return inUpperLobe || inLowerLobe;
      }
    };

    const generateBranch = (x, y, angle, length, depth, maxDepth, side, parent = null) => {
      if (depth > maxDepth) {
        const cluster = new AlveoliCluster(x, y, depth, side, parent);
        allAlveoli.push(cluster);
        if (parent) parent.alveoli = cluster;
        return null;
      }

      const branch = new Branch(x, y, angle, length, depth, maxDepth, side, parent);
      allBranches.push(branch);

      // More aggressive branching for fuller appearance
      const nextLength = length * (0.68 + Math.random() * 0.1);
      const spread = 0.42 - depth * 0.03;
      const jitter = (Math.random() - 0.5) * 0.2;

      // More children at earlier depths for fuller tree
      const childCount = depth < 2 ? 3 : (depth < 4 ? (Math.random() > 0.2 ? 3 : 2) : 2);

      const angles = [];
      if (childCount === 2) {
        angles.push(angle - spread + jitter, angle + spread + jitter);
      } else {
        angles.push(angle - spread + jitter, angle + jitter * 0.3, angle + spread + jitter);
      }

      angles.forEach((childAngle, i) => {
        const childLength = nextLength * (i === 1 && childCount === 3 ? 0.85 : 1);
        const testX = branch.x2 + Math.cos(childAngle) * childLength;
        const testY = branch.y2 + Math.sin(childAngle) * childLength;

        // Only generate if inside lung boundary or at early depth
        if (depth < 3 || isInsideLung(testX, testY, side)) {
          const child = generateBranch(branch.x2, branch.y2, childAngle, childLength, depth + 1, maxDepth, side, branch);
          if (child) branch.children.push(child);
        } else if (depth >= 3) {
          // Create alveoli at boundary
          const cluster = new AlveoliCluster(branch.x2, branch.y2, depth + 1, side, branch);
          allAlveoli.push(cluster);
        }
      });

      return branch;
    };

    // Create trachea (windpipe)
    const tracheaLength = canvas.height * 0.05;
    const trachea = new Branch(centerX, startY - tracheaLength, Math.PI / 2, tracheaLength, 0, 8, 'center');
    allBranches.push(trachea);

    // Main bronchi split
    const mainBronchusLength = 35 * lungScale / 3;

    // === RIGHT LUNG (3 lobes) ===
    // Right main bronchus
    const rightMain = generateBranch(centerX, startY, Math.PI / 2 + 0.35, mainBronchusLength, 1, 8, 'right', trachea);

    // Right upper lobe branches
    generateBranch(centerX + 15 * lungScale / 3, startY + 10 * lungScale / 3, Math.PI / 2 + 0.9, 28 * lungScale / 3, 2, 7, 'right', trachea);
    generateBranch(centerX + 25 * lungScale / 3, startY + 5 * lungScale / 3, Math.PI * 0.15, 22 * lungScale / 3, 2, 6, 'right', trachea);

    // Right middle lobe branches
    generateBranch(centerX + 30 * lungScale / 3, startY + 45 * lungScale / 3, Math.PI / 2 + 0.6, 25 * lungScale / 3, 2, 7, 'right', trachea);
    generateBranch(centerX + 40 * lungScale / 3, startY + 55 * lungScale / 3, Math.PI * 0.35, 20 * lungScale / 3, 3, 6, 'right', trachea);

    // Right lower lobe branches
    generateBranch(centerX + 20 * lungScale / 3, startY + 80 * lungScale / 3, Math.PI / 2 + 0.4, 30 * lungScale / 3, 2, 8, 'right', trachea);
    generateBranch(centerX + 35 * lungScale / 3, startY + 95 * lungScale / 3, Math.PI / 2 + 0.7, 25 * lungScale / 3, 3, 7, 'right', trachea);
    generateBranch(centerX + 25 * lungScale / 3, startY + 110 * lungScale / 3, Math.PI * 0.6, 22 * lungScale / 3, 3, 6, 'right', trachea);

    // === LEFT LUNG (2 lobes with cardiac notch) ===
    // Left main bronchus
    const leftMain = generateBranch(centerX, startY, Math.PI / 2 - 0.35, mainBronchusLength * 0.95, 1, 7, 'left', trachea);

    // Left upper lobe branches
    generateBranch(centerX - 15 * lungScale / 3, startY + 8 * lungScale / 3, Math.PI / 2 - 0.85, 26 * lungScale / 3, 2, 7, 'left', trachea);
    generateBranch(centerX - 22 * lungScale / 3, startY + 3 * lungScale / 3, Math.PI * 0.85, 20 * lungScale / 3, 2, 6, 'left', trachea);
    generateBranch(centerX - 28 * lungScale / 3, startY + 40 * lungScale / 3, Math.PI / 2 - 0.5, 22 * lungScale / 3, 2, 6, 'left', trachea);

    // Left lower lobe branches (avoiding cardiac notch area)
    generateBranch(centerX - 18 * lungScale / 3, startY + 75 * lungScale / 3, Math.PI / 2 - 0.3, 28 * lungScale / 3, 2, 7, 'left', trachea);
    generateBranch(centerX - 30 * lungScale / 3, startY + 90 * lungScale / 3, Math.PI / 2 - 0.6, 24 * lungScale / 3, 3, 6, 'left', trachea);
    generateBranch(centerX - 22 * lungScale / 3, startY + 105 * lungScale / 3, Math.PI * 0.55, 20 * lungScale / 3, 3, 6, 'left', trachea);

    // Add extra peripheral alveoli to fill out the lung shape
    const addPeripheralAlveoli = (side) => {
      const count = 35;
      for (let i = 0; i < count; i++) {
        let x, y, attempts = 0;
        do {
          if (side === 'right') {
            x = centerX + (20 + Math.random() * 90) * lungScale / 3;
            y = startY + (10 + Math.random() * 180) * lungScale / 3;
          } else {
            x = centerX - (20 + Math.random() * 75) * lungScale / 3;
            y = startY + (10 + Math.random() * 170) * lungScale / 3;
          }
          attempts++;
        } while (!isInsideLung(x, y, side) && attempts < 20);

        if (isInsideLung(x, y, side)) {
          const cluster = new AlveoliCluster(x, y, 7, side);
          cluster.spheres.forEach(s => {
            s.radius *= 0.7; // Smaller peripheral alveoli
          });
          allAlveoli.push(cluster);
        }
      }
    };

    addPeripheralAlveoli('right');
    addPeripheralAlveoli('left');

    // Calculate max path distance
    let maxPathDist = 0;
    allBranches.forEach(b => {
      const dist = b.getPathDistance();
      if (dist > maxPathDist) maxPathDist = dist;
    });

    // Store lung data for animation
    lungDataRef.current = {
      allBranches,
      allAlveoli,
      particles,
      trachea,
      maxPathDist,
      colorDeoxygenated,
      colorOxygenated,
      colorExhale,
      centerX,
      startY,
      OxygenParticle,
      // Trachea entry glow state
      tracheaGlow: 0,
      lastPhase: null,
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [primaryHue]);

  // Animation loop for lung capillaries
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !lungDataRef.current) return;

    const ctx = canvas.getContext('2d');
    const startTime = Date.now();

    const {
      allBranches,
      allAlveoli,
      particles,
      trachea,
      maxPathDist,
      colorDeoxygenated,
      colorOxygenated,
      colorExhale,
      centerX,
      startY,
      OxygenParticle,
    } = lungDataRef.current;

    const MAX_PARTICLES = 120;

    const spawnParticle = () => {
      if (particles.length < MAX_PARTICLES) {
        const p = new OxygenParticle(trachea.x1, trachea.y1, trachea);
        particles.push(p);
      }
    };

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = (Date.now() - startTime) / 1000;

      // Get breath phase from session
      const phase = breathSession.phase; // 'inhale', 'exhale', 'holdFull', 'holdEmpty'
      const phaseProgress = breathSession.phaseProgress || 0.5;
      const isInhaling = phase === 'inhale';
      const isHoldingFull = phase === 'holdFull';
      const isExhaling = phase === 'exhale';
      const isHoldingEmpty = phase === 'holdEmpty';
      const isActive = breathSession.isActive;

      // Dark background
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Vignette
      const vignette = ctx.createRadialGradient(
        centerX, canvas.height * 0.4, 0,
        centerX, canvas.height * 0.4, canvas.width * 0.7
      );
      vignette.addColorStop(0, 'transparent');
      vignette.addColorStop(0.7, 'transparent');
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate breath expansion scale (lungs expand ~15% when full)
      // Use smooth easing for natural breathing motion
      const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
      const easedProgress = easeInOutSine(phaseProgress);

      let targetBreathScale = 0.92; // Default contracted state
      if (!isActive) {
        targetBreathScale = 0.96; // Resting state
      } else if (isInhaling) {
        targetBreathScale = 0.92 + easedProgress * 0.14; // Expand from 0.92 to 1.06
      } else if (isHoldingFull) {
        targetBreathScale = 1.06; // Fully expanded
      } else if (isExhaling) {
        targetBreathScale = 1.06 - easedProgress * 0.14; // Contract from 1.06 to 0.92
      } else if (isHoldingEmpty) {
        targetBreathScale = 0.92; // Fully contracted
      }

      // Smooth the breath scale with velocity-based interpolation
      if (!lungDataRef.current.breathScale) lungDataRef.current.breathScale = targetBreathScale;
      if (!lungDataRef.current.breathVelocity) lungDataRef.current.breathVelocity = 0;

      // Spring-like smoothing for fluid motion
      const stiffness = 0.04;
      const damping = 0.85;
      const diff = targetBreathScale - lungDataRef.current.breathScale;
      lungDataRef.current.breathVelocity = lungDataRef.current.breathVelocity * damping + diff * stiffness;
      lungDataRef.current.breathScale += lungDataRef.current.breathVelocity;
      const breathScale = lungDataRef.current.breathScale;

      // Calculate lung center for scaling (center of the lung mass)
      const lungCenterY = startY + canvas.height * 0.25;

      // Detect phase transitions for trachea flash
      if (lungDataRef.current.lastPhase !== phase) {
        if (phase === 'inhale' && lungDataRef.current.lastPhase !== 'inhale') {
          lungDataRef.current.tracheaGlow = 1.5; // Flash on inhale start
        }
        if (phase === 'inhale') {
          // Reset bloom flags for new inhale cycle
          allAlveoli.forEach(a => { a.hasBloomedThisCycle = false; });
        }
        lungDataRef.current.lastPhase = phase;
      }

      // Decay trachea glow
      if (lungDataRef.current.tracheaGlow > 0) {
        lungDataRef.current.tracheaGlow *= 0.92;
        if (lungDataRef.current.tracheaGlow < 0.01) lungDataRef.current.tracheaGlow = 0;
      }

      // Calculate fill progress for each branch using PATH DISTANCE (not just depth)
      // This creates the visible "wave" traveling through the bronchial tree
      allBranches.forEach(branch => {
        const pathNorm = branch.getNormalizedPathDistance(maxPathDist);

        // Timing per spec: depthLevel * 0.15 delay, 0.25 window
        const depthDelay = pathNorm * 0.6; // Stagger based on distance from trachea
        const depthWindow = 0.25;

        if (!isActive) {
          branch.targetFillProgress = 0.15; // Subtle ambient glow
          branch.targetFillPosition = 0.5;
        } else if (isInhaling) {
          // Progressive fill: starts at trachea, flows outward
          const fillStart = depthDelay;
          const fillEnd = depthDelay + depthWindow;
          const raw = Math.max(0, Math.min(1, (easedProgress - fillStart) / (fillEnd - fillStart + 0.001)));
          branch.targetFillProgress = easeInOutSine(raw);

          // Fill position travels along the branch (0=base, 1=tip)
          branch.targetFillPosition = Math.min(1, raw * 1.5);
        } else if (isHoldingFull) {
          branch.targetFillProgress = 1;
          branch.targetFillPosition = 1;
        } else if (isExhaling) {
          // Reverse: alveoli drain first, then branches, then trunk
          const drainDelay = (1 - pathNorm) * 0.6;
          const drainWindow = 0.25;
          const drainStart = drainDelay;
          const drainEnd = drainDelay + drainWindow;
          const raw = Math.max(0, Math.min(1, (easedProgress - drainStart) / (drainEnd - drainStart + 0.001)));
          branch.targetFillProgress = 1 - easeInOutSine(raw);

          // Fill position retreats from tip to base
          branch.targetFillPosition = 1 - Math.min(1, raw * 1.5);
        } else if (isHoldingEmpty) {
          branch.targetFillProgress = 0.05; // Very dim baseline
          branch.targetFillPosition = 0;
        }

        // Smooth interpolation
        branch.fillProgress += (branch.targetFillProgress - branch.fillProgress) * 0.08;
        branch.fillPosition += (branch.targetFillPosition - branch.fillPosition) * 0.1;
      });

      // Update alveoli with path-distance timing and BLOOM effect
      allAlveoli.forEach(alveolus => {
        // Use parent branch timing or depth-based fallback
        const arrivalTiming = alveolus.getArrivalTiming(maxPathDist);
        const arrivalDelay = arrivalTiming * 0.6 + 0.15; // Alveoli fill slightly after their parent branch
        const arrivalWindow = 0.2;

        let targetFill = 0.1;
        if (!isActive) {
          targetFill = 0.1;
          alveolus.hasBloomedThisCycle = false;
        } else if (isInhaling) {
          const fillStart = arrivalDelay;
          const fillEnd = arrivalDelay + arrivalWindow;
          const raw = Math.max(0, Math.min(1, (easedProgress - fillStart) / (fillEnd - fillStart + 0.001)));
          targetFill = easeInOutSine(raw);

          // BLOOM EFFECT: Trigger when oxygen "arrives" (crosses 0.5 threshold)
          if (targetFill > 0.5 && !alveolus.hasBloomedThisCycle) {
            alveolus.hasBloomedThisCycle = true;
            alveolus.bloomStartTime = elapsed;
            alveolus.bloomIntensity = 1.5; // Brightness spike
            alveolus.bloomScale = 1.08; // Scale pop
          }
        } else if (isHoldingFull) {
          targetFill = 1;
        } else if (isExhaling) {
          // Alveoli drain first (inverted timing)
          const drainDelay = (1 - arrivalTiming) * 0.5;
          const drainWindow = 0.3;
          const drainStart = drainDelay;
          const drainEnd = drainDelay + drainWindow;
          const raw = Math.max(0, Math.min(1, (easedProgress - drainStart) / (drainEnd - drainStart + 0.001)));
          targetFill = 1 - easeInOutSine(raw);
          alveolus.hasBloomedThisCycle = false;
        } else {
          targetFill = 0;
          alveolus.hasBloomedThisCycle = false;
        }

        alveolus.targetFillProgress = targetFill;

        // Smooth interpolation for fill
        alveolus.fillProgress += (alveolus.targetFillProgress - alveolus.fillProgress) * 0.08;

        // Decay bloom effects (300ms duration)
        const bloomDuration = 0.3;
        const bloomAge = elapsed - alveolus.bloomStartTime;
        if (bloomAge < bloomDuration && alveolus.bloomIntensity > 1) {
          const bloomProgress = bloomAge / bloomDuration;
          const bloomEase = 1 - Math.pow(bloomProgress, 2); // Fast attack, slow decay
          alveolus.bloomIntensity = 1 + 0.5 * bloomEase;
          alveolus.bloomScale = 1 + 0.08 * bloomEase;
        } else {
          alveolus.bloomIntensity += (1 - alveolus.bloomIntensity) * 0.15;
          alveolus.bloomScale += (1 - alveolus.bloomScale) * 0.15;
        }
      });

      // Spawn particles during inhale
      if (isActive && isInhaling && Math.random() < 0.25) {
        spawnParticle();
      }

      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update(isInhaling);
        if (!particles[i].alive) {
          particles.splice(i, 1);
        }
      }

      // Apply breath expansion transform
      ctx.save();
      ctx.translate(centerX, lungCenterY);
      ctx.scale(breathScale, breathScale);
      ctx.translate(-centerX, -lungCenterY);

      // Trachea entry glow (flash on inhale start)
      const tracheaGlow = lungDataRef.current.tracheaGlow || 0;
      if (tracheaGlow > 0.05 || isInhaling) {
        const baseGlow = isInhaling ? 0.3 + easedProgress * 0.2 : 0.2;
        const glowIntensity = baseGlow + tracheaGlow * 0.5;
        const entryGradient = ctx.createRadialGradient(
          centerX, startY - 10, 0,
          centerX, startY - 10, 40
        );
        entryGradient.addColorStop(0, `hsla(${colorOxygenated.h}, ${colorOxygenated.s}%, ${colorOxygenated.l + 10}%, ${glowIntensity})`);
        entryGradient.addColorStop(0.5, `hsla(${colorOxygenated.h}, ${colorOxygenated.s}%, ${colorOxygenated.l}%, ${glowIntensity * 0.4})`);
        entryGradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(centerX, startY - 10, 40, 0, Math.PI * 2);
        ctx.fillStyle = entryGradient;
        ctx.fill();
      }

      // Draw branches with gradient fill along length
      allBranches.forEach(branch => {
        const fill = branch.fillProgress;
        const fillPos = branch.fillPosition || 0;

        // Color interpolation with EXHALE shift toward cooler tone
        let targetColor = colorOxygenated;
        if (isExhaling || isHoldingEmpty) {
          // Shift toward cooler exhale color
          const exhaleBlend = isExhaling ? easedProgress : 1;
          targetColor = {
            h: colorOxygenated.h + (colorExhale.h - colorOxygenated.h) * exhaleBlend * 0.5,
            s: colorOxygenated.s + (colorExhale.s - colorOxygenated.s) * exhaleBlend * 0.5,
            l: colorOxygenated.l + (colorExhale.l - colorOxygenated.l) * exhaleBlend * 0.3
          };
        }

        const h = colorDeoxygenated.h + (targetColor.h - colorDeoxygenated.h) * fill;
        const s = colorDeoxygenated.s + (targetColor.s - colorDeoxygenated.s) * fill;
        const l = colorDeoxygenated.l + (targetColor.l - colorDeoxygenated.l) * fill;

        // Branch glow (softer)
        if (fill > 0.1) {
          ctx.strokeStyle = `hsla(${h}, ${s}%, ${l + 5}%, ${0.1 * fill})`;
          ctx.lineWidth = branch.thickness + 4;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(branch.x1, branch.y1);
          ctx.lineTo(branch.x2, branch.y2);
          ctx.stroke();
        }

        // GRADIENT FILL along branch: creates "traveling" oxygenation effect
        // Draw branch as gradient from base (dimmer/filled) to tip (brighter/filling)
        const gradient = ctx.createLinearGradient(branch.x1, branch.y1, branch.x2, branch.y2);

        // Base of branch (already filled)
        const baseFill = Math.min(1, fill * 1.2);
        const baseH = colorDeoxygenated.h + (targetColor.h - colorDeoxygenated.h) * baseFill;
        const baseS = colorDeoxygenated.s + (targetColor.s - colorDeoxygenated.s) * baseFill;
        const baseL = colorDeoxygenated.l + (targetColor.l - colorDeoxygenated.l) * baseFill;
        const baseAlpha = 0.3 + baseFill * 0.5;

        // Tip of branch (filling or unfilled)
        const tipFill = Math.max(0, fill * 0.6);
        const tipH = colorDeoxygenated.h + (targetColor.h - colorDeoxygenated.h) * tipFill;
        const tipS = colorDeoxygenated.s + (targetColor.s - colorDeoxygenated.s) * tipFill;
        const tipL = colorDeoxygenated.l + (targetColor.l - colorDeoxygenated.l) * tipFill;
        const tipAlpha = 0.2 + tipFill * 0.5;

        gradient.addColorStop(0, `hsla(${baseH}, ${baseS}%, ${baseL}%, ${baseAlpha})`);
        gradient.addColorStop(Math.min(0.95, fillPos), `hsla(${baseH}, ${baseS}%, ${baseL}%, ${baseAlpha})`);
        gradient.addColorStop(Math.min(1, fillPos + 0.05), `hsla(${tipH}, ${tipS}%, ${tipL}%, ${tipAlpha})`);
        gradient.addColorStop(1, `hsla(${tipH}, ${tipS}%, ${tipL}%, ${tipAlpha * 0.7})`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = branch.thickness;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(branch.x1, branch.y1);
        ctx.lineTo(branch.x2, branch.y2);
        ctx.stroke();

        // Bright "wavefront" glow at fill position (the traveling oxygen)
        if (fill > 0.05 && fill < 0.95 && isActive) {
          const wavefrontX = branch.x1 + (branch.x2 - branch.x1) * fillPos;
          const wavefrontY = branch.y1 + (branch.y2 - branch.y1) * fillPos;
          const glowSize = 6 + branch.thickness;

          const waveGradient = ctx.createRadialGradient(wavefrontX, wavefrontY, 0, wavefrontX, wavefrontY, glowSize);
          waveGradient.addColorStop(0, `hsla(${targetColor.h}, ${targetColor.s + 10}%, ${targetColor.l + 15}%, ${0.5 * fill})`);
          waveGradient.addColorStop(0.5, `hsla(${targetColor.h}, ${targetColor.s}%, ${targetColor.l}%, ${0.2 * fill})`);
          waveGradient.addColorStop(1, 'transparent');

          ctx.beginPath();
          ctx.arc(wavefrontX, wavefrontY, glowSize, 0, Math.PI * 2);
          ctx.fillStyle = waveGradient;
          ctx.fill();
        }
      });

      // Draw alveoli with BLOOM effect and hold-in shimmer
      allAlveoli.forEach(cluster => {
        const fill = cluster.fillProgress;
        const bloomIntensity = cluster.bloomIntensity || 1;
        const bloomScale = cluster.bloomScale || 1;

        // HOLD-IN effects: gentle pulse (scale 1.0 → 1.05 → 1.0) and shimmer
        const holdPulse = isHoldingFull ? Math.sin(elapsed * 2 + cluster.pulsePhase) * 0.05 : 0;
        const shimmer = isHoldingFull ? Math.sin(elapsed * 8 + cluster.pulsePhase * 2) * 0.15 : 0;

        // HOLD-OUT: subtle ambient pulse so it still feels alive
        const restPulse = isHoldingEmpty ? Math.sin(elapsed * 1.5 + cluster.pulsePhase) * 0.03 : 0;

        // Exhale color shift
        let targetColor = colorOxygenated;
        if (isExhaling || isHoldingEmpty) {
          const exhaleBlend = isExhaling ? easedProgress : 1;
          targetColor = {
            h: colorOxygenated.h + (colorExhale.h - colorOxygenated.h) * exhaleBlend * 0.6,
            s: colorOxygenated.s + (colorExhale.s - colorOxygenated.s) * exhaleBlend * 0.5,
            l: colorOxygenated.l + (colorExhale.l - colorOxygenated.l) * exhaleBlend * 0.4
          };
        }

        cluster.spheres.forEach(sphere => {
          const x = cluster.x + sphere.offsetX;
          const y = cluster.y + sphere.offsetY;

          // Apply bloom scale, hold pulse, and rest pulse
          const scaleMultiplier = bloomScale * (1 + holdPulse + restPulse);
          const r = sphere.radius * (1 + fill * 0.1) * scaleMultiplier;

          // Color with bloom intensity boost
          const h = colorDeoxygenated.h + (targetColor.h - colorDeoxygenated.h) * fill;
          const s = colorDeoxygenated.s + (targetColor.s - colorDeoxygenated.s) * fill;
          const baseLightness = colorDeoxygenated.l + (targetColor.l - colorDeoxygenated.l) * fill;
          const l = baseLightness + (bloomIntensity - 1) * 20 + shimmer * 8; // Bloom brightens, shimmer adds sparkle

          const glowSize = r * (1.5 + fill * 0.4);

          // Outer glow (bloom makes this bigger and brighter)
          const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize * bloomIntensity);
          const glowAlpha = (0.25 + fill * 0.35) * bloomIntensity;
          glowGradient.addColorStop(0, `hsla(${h}, ${s + 10}%, ${l + 10}%, ${glowAlpha})`);
          glowGradient.addColorStop(0.4, `hsla(${h}, ${s}%, ${l}%, ${glowAlpha * 0.4})`);
          glowGradient.addColorStop(1, 'transparent');

          ctx.beginPath();
          ctx.arc(x, y, glowSize * bloomIntensity, 0, Math.PI * 2);
          ctx.fillStyle = glowGradient;
          ctx.fill();

          // Core sphere
          const coreGradient = ctx.createRadialGradient(x - r * 0.25, y - r * 0.25, 0, x, y, r);
          coreGradient.addColorStop(0, `hsla(${h}, ${s + 5}%, ${l + 8}%, ${(0.45 + fill * 0.35) * bloomIntensity})`);
          coreGradient.addColorStop(0.6, `hsla(${h}, ${s}%, ${l}%, ${(0.3 + fill * 0.3) * bloomIntensity})`);
          coreGradient.addColorStop(1, `hsla(${h}, ${s - 5}%, ${l - 8}%, ${0.15 + fill * 0.2})`);

          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fillStyle = coreGradient;
          ctx.fill();

          // SHIMMER sparkles during hold-in (oxygen exchange happening)
          if (isHoldingFull && shimmer > 0.05) {
            const sparkleAlpha = shimmer * 0.8;
            ctx.beginPath();
            ctx.arc(x + Math.cos(elapsed * 5 + sphere.phase) * r * 0.3,
                   y + Math.sin(elapsed * 5 + sphere.phase) * r * 0.3,
                   1.5, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${targetColor.h}, 90%, 80%, ${sparkleAlpha})`;
            ctx.fill();
          }
        });
      });

      // Draw particles
      particles.forEach(p => {
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
        gradient.addColorStop(0, `hsla(${colorOxygenated.h}, 90%, 70%, ${p.alpha})`);
        gradient.addColorStop(0.5, `hsla(${colorOxygenated.h}, 80%, 60%, ${p.alpha * 0.5})`);
        gradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      // Draw filled lung tissue (behind everything)
      // This is drawn in the animate loop to apply breath-based fill color

      // Calculate average fill for lung tissue color
      const avgFill = isActive ? (isHoldingFull ? 1 : (isHoldingEmpty ? 0.05 : breathSession.phaseProgress * (isInhaling ? 1 : -1) + (isExhaling ? 1 : 0))) : 0.25;
      const tissueH = colorDeoxygenated.h + (colorOxygenated.h - colorDeoxygenated.h) * Math.max(0, Math.min(1, avgFill));

      // Compute convex hull for lung outlines from alveoli positions
      const computeConvexHull = (points) => {
        if (points.length < 3) return points;

        // Find leftmost point
        let start = 0;
        for (let i = 1; i < points.length; i++) {
          if (points[i].x < points[start].x) start = i;
        }

        const hull = [];
        let current = start;
        do {
          hull.push(points[current]);
          let next = 0;
          for (let i = 1; i < points.length; i++) {
            if (next === current) {
              next = i;
              continue;
            }
            const cross = (points[i].x - points[current].x) * (points[next].y - points[current].y) -
                         (points[i].y - points[current].y) * (points[next].x - points[current].x);
            if (cross > 0) next = i;
          }
          current = next;
        } while (current !== start && hull.length < points.length);

        return hull;
      };

      // Draw smooth curve through hull points
      const drawSmoothHull = (hull, padding = 12) => {
        if (hull.length < 3) return;

        // Expand hull outward by padding
        const expandedHull = hull.map((p, i) => {
          const prev = hull[(i - 1 + hull.length) % hull.length];
          const next = hull[(i + 1) % hull.length];
          const nx = (next.y - prev.y);
          const ny = -(next.x - prev.x);
          const len = Math.sqrt(nx * nx + ny * ny) || 1;
          return { x: p.x + (nx / len) * padding, y: p.y + (ny / len) * padding };
        });

        ctx.beginPath();
        ctx.moveTo(expandedHull[0].x, expandedHull[0].y);

        for (let i = 0; i < expandedHull.length; i++) {
          const p0 = expandedHull[(i - 1 + expandedHull.length) % expandedHull.length];
          const p1 = expandedHull[i];
          const p2 = expandedHull[(i + 1) % expandedHull.length];
          const p3 = expandedHull[(i + 2) % expandedHull.length];

          // Catmull-Rom to Bezier conversion
          const cp1x = p1.x + (p2.x - p0.x) / 6;
          const cp1y = p1.y + (p2.y - p0.y) / 6;
          const cp2x = p2.x - (p3.x - p1.x) / 6;
          const cp2y = p2.y - (p3.y - p1.y) / 6;

          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
        }
        ctx.closePath();
      };

      // Collect points for each lung
      const rightPoints = [];
      const leftPoints = [];

      // Add alveoli positions
      allAlveoli.forEach(cluster => {
        cluster.spheres.forEach(sphere => {
          const point = { x: cluster.x + sphere.offsetX, y: cluster.y + sphere.offsetY };
          if (cluster.side === 'right') {
            rightPoints.push(point);
          } else if (cluster.side === 'left') {
            leftPoints.push(point);
          }
        });
      });

      // Add branch endpoints
      allBranches.forEach(branch => {
        if (branch.side === 'right') {
          rightPoints.push({ x: branch.x2, y: branch.y2 });
        } else if (branch.side === 'left') {
          leftPoints.push({ x: branch.x2, y: branch.y2 });
        }
      });

      // Add trachea connection points
      rightPoints.push({ x: centerX + 5, y: startY });
      leftPoints.push({ x: centerX - 5, y: startY });

      // Compute and draw right lung
      if (rightPoints.length > 2) {
        const rightHull = computeConvexHull(rightPoints);
        drawSmoothHull(rightHull, 15);

        // Find center for gradient
        const rcx = rightPoints.reduce((s, p) => s + p.x, 0) / rightPoints.length;
        const rcy = rightPoints.reduce((s, p) => s + p.y, 0) / rightPoints.length;

        // Subtle lung tissue fill
        const rightGradient = ctx.createRadialGradient(rcx, rcy, 0, rcx, rcy, 150);
        rightGradient.addColorStop(0, `hsla(${tissueH}, 50%, 35%, 0.08)`);
        rightGradient.addColorStop(0.6, `hsla(${tissueH}, 45%, 25%, 0.05)`);
        rightGradient.addColorStop(1, `hsla(${tissueH}, 40%, 20%, 0.02)`);
        ctx.fillStyle = rightGradient;
        ctx.fill();

        // Barely visible outline - let branches define the shape
        ctx.strokeStyle = `hsla(${tissueH}, 35%, 50%, 0.1)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Compute and draw left lung
      if (leftPoints.length > 2) {
        const leftHull = computeConvexHull(leftPoints);
        drawSmoothHull(leftHull, 15);

        const lcx = leftPoints.reduce((s, p) => s + p.x, 0) / leftPoints.length;
        const lcy = leftPoints.reduce((s, p) => s + p.y, 0) / leftPoints.length;

        const leftGradient = ctx.createRadialGradient(lcx, lcy, 0, lcx, lcy, 130);
        leftGradient.addColorStop(0, `hsla(${tissueH}, 50%, 35%, 0.08)`);
        leftGradient.addColorStop(0.6, `hsla(${tissueH}, 45%, 25%, 0.05)`);
        leftGradient.addColorStop(1, `hsla(${tissueH}, 40%, 20%, 0.02)`);
        ctx.fillStyle = leftGradient;
        ctx.fill();

        // Barely visible outline
        ctx.strokeStyle = `hsla(${tissueH}, 35%, 50%, 0.1)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Trachea tube (subtle)
      ctx.fillStyle = `hsla(${tissueH}, 35%, 40%, 0.1)`;
      ctx.beginPath();
      ctx.moveTo(centerX - 8, startY - 25);
      ctx.lineTo(centerX + 8, startY - 25);
      ctx.lineTo(centerX + 6, startY + 5);
      ctx.lineTo(centerX - 6, startY + 5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = `hsla(${tissueH}, 40%, 50%, 0.12)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Restore transform after lung drawing
      ctx.restore();
    };

    animate();

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [breathSession.isActive, breathSession.phase, breathSession.phaseProgress, primaryHue]);

  // Handle swipe gestures
  const handleTouchStart = useCallback((e) => {
    if (showUI) return;
    const touch = e.touches[0];
    swipeStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  }, [showUI]);

  const handleTouchEnd = useCallback((e) => {
    if (!swipeStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - swipeStartRef.current.x;
    const deltaY = touch.clientY - swipeStartRef.current.y;
    const deltaTime = Date.now() - swipeStartRef.current.time;
    const screenHeight = window.innerHeight;

    const minSwipeDistance = 50;
    const maxSwipeTime = 500;

    // Vertical swipe UP: open technique selector
    if (deltaY < -minSwipeDistance && Math.abs(deltaY) > Math.abs(deltaX) * 1.5 && deltaTime < maxSwipeTime) {
      if (swipeStartRef.current.y > screenHeight * 0.5) {
        setShowUI(true);
      }
    }
    // Vertical swipe DOWN: close technique selector
    if (deltaY > minSwipeDistance && showUI) {
      setShowUI(false);
    }

    swipeStartRef.current = null;
  }, [showUI]);

  // Two-finger swipe (wheel event on trackpad) to open/close menu
  const showUIRef = useRef(showUI);
  showUIRef.current = showUI;

  useEffect(() => {
    const handleWheel = (e) => {
      // When menu is open, let scroll pass through naturally
      if (showUIRef.current) return;

      wheelAccumRef.current += e.deltaY;

      clearTimeout(wheelTimeoutRef.current);
      wheelTimeoutRef.current = setTimeout(() => {
        wheelAccumRef.current = 0;
      }, 200);

      const threshold = 50;

      // Swipe UP = open menu
      if (wheelAccumRef.current > threshold) {
        e.preventDefault();
        setShowUI(true);
        wheelAccumRef.current = 0;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <main
      onClick={() => !showUI && !breathSession.isActive && startBreathSession(breathSession.technique)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
        cursor: 'pointer',
      }}
    >
      {/* Lung capillaries canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />

      {/* Current technique name - smaller, dimmer, top right */}
      <div style={{
        position: 'absolute',
        top: '2rem',
        right: '1.5rem',
        zIndex: 1,
      }}>
        <span style={{
          color: `hsla(${primaryHue}, 45%, 60%, 0.35)`,
          fontSize: '0.6rem',
          fontFamily: '"Jost", sans-serif',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}>
          {breathTechniques[breathSession.technique]?.name || 'Calm'}
        </span>
      </div>

      {/* Phase label - with fade transition for text changes */}
      <div style={{
        position: 'absolute',
        bottom: '4rem',
        left: '50%',
        transform: 'translateX(-50%)',
        color: breathSession.phase === 'holdFull' || breathSession.phase === 'holdEmpty'
          ? 'rgba(255,215,100,0.7)'
          : `hsla(${primaryHue}, 52%, 68%, 0.65)`,
        fontSize: '0.85rem',
        fontFamily: '"Jost", sans-serif',
        letterSpacing: '0.25em',
        textTransform: 'uppercase',
        transition: 'color 0.4s ease, opacity 0.3s ease',
        opacity: breathSession.isActive ? 1 : 0.7,
        zIndex: 1,
      }}>
        {breathSession.isActive
          ? breathTechniques[breathSession.technique]?.phases[breathSession.phaseIndex]?.label || ''
          : 'tap to begin'}
      </div>

      {/* Countdown - reduced size and increased transparency */}
      {breathSession.isActive && (
        <div style={{
          position: 'absolute',
          bottom: '1.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          color: `hsla(${primaryHue}, 40%, 70%, 0.6)`,
          fontSize: '1.6rem',
          fontFamily: '"Jost", sans-serif',
          fontWeight: 300,
          letterSpacing: '0.05em',
          zIndex: 1,
        }}>
          {Math.ceil(breathTechniques[breathSession.technique]?.phases[breathSession.phaseIndex]?.duration * (1 - breathSession.phaseProgress)) || ''}
        </div>
      )}

      {/* Swipe hint at bottom */}
      {!showUI && (
        <div style={{
          position: 'absolute',
          bottom: '1.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.3rem',
          opacity: 0.25,
          pointerEvents: 'none',
          zIndex: 1,
        }}>
          <div style={{
            width: '2px',
            height: '24px',
            background: `linear-gradient(to top, hsla(${primaryHue}, 52%, 68%, 0.5), transparent)`,
            borderRadius: '1px',
          }} />
        </div>
      )}

      {/* Technique selector - bottom drawer */}
      {showUI && (
        <>
          {/* Backdrop - tap to close */}
          <div
            onClick={(e) => { e.stopPropagation(); setShowUI(false); }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 10,
              animation: 'fadeInBreath 0.5s ease-out',
            }}
          />
          {/* Bottom drawer */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: '50vh',
            background: 'rgba(10,10,15,0.95)',
            borderRadius: '20px 20px 0 0',
            backdropFilter: 'blur(20px)',
            border: `1px solid hsla(${primaryHue}, 52%, 68%, 0.12)`,
            borderBottom: 'none',
            zIndex: 11,
            animation: 'slideUpBreath 0.5s ease-out',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Drawer handle */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '0.75rem',
              cursor: 'pointer',
            }} onClick={(e) => { e.stopPropagation(); setShowUI(false); }}>
              <div style={{
                width: '36px',
                height: '4px',
                background: `hsla(${primaryHue}, 52%, 68%, 0.3)`,
                borderRadius: '2px',
              }} />
            </div>

            {/* Title */}
            <div style={{
              textAlign: 'center',
              padding: '0 1rem 0.75rem',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <span style={{
                color: `hsla(${primaryHue}, 52%, 68%, 0.7)`,
                fontSize: '0.6rem',
                fontFamily: '"Jost", sans-serif',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}>Breathing Techniques</span>
            </div>

            {/* Scrollable list */}
            <div style={{
              overflowY: 'auto',
              padding: '0.5rem 0',
              WebkitOverflowScrolling: 'touch',
            }}>
              {Object.entries(breathTechniques).map(([key, tech]) => (
                <button
                  key={key}
                  onClick={(e) => {
                    e.stopPropagation();
                    setTimeout(() => {
                      if (breathSession.isActive) stopBreathSession();
                      startBreathSession(key);
                      setShowUI(false);
                    }, 80);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    background: breathSession.technique === key ? `hsla(${primaryHue}, 52%, 68%, 0.1)` : 'transparent',
                    border: 'none',
                    borderLeft: breathSession.technique === key ? `3px solid hsla(${primaryHue}, 52%, 68%, 0.6)` : '3px solid transparent',
                    color: breathSession.technique === key ? `hsl(${primaryHue}, 52%, 68%)` : 'rgba(255,255,255,0.6)',
                    padding: '0.85rem 1.5rem',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontFamily: '"Jost", sans-serif',
                    textAlign: 'left',
                    transition: 'all 0.4s ease',
                  }}
                >
                  <div style={{ fontWeight: 500 }}>{tech.name}</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '0.25rem' }}>{tech.description || ''}</div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
      <style>{`
        @keyframes slideUpBreath {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes fadeInBreath {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </main>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

// ============================================================================
// MUSIC TRACKS - Add your WAV files here
// Place files in the same folder as index.html, then list them below
// ============================================================================
const musicTracks = [
  { name: 'Ambi', file: 'Ambi.wav' },
  { name: 'Non-attachment', file: 'Non-attachment.wav' },
  { name: 'Soundsleep', file: 'Soundsleep.wav' },
  { name: 'You', file: 'You.wav' },
];

function Still() {
  // Core state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedQuotes, setSavedQuotes] = useState([]);
  const [shuffledQuotes, setShuffledQuotes] = useState([]);
  const [view, setView] = useState('scroll');
  const [selectedSchools, setSelectedSchools] = useState(new Set());
  const [selectedThemes, setSelectedThemes] = useState(new Set());
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [toast, setToast] = useState(null);
  const [settings, setSettings] = useState(defaultSettings);
  const [showColorOverlay, setShowColorOverlay] = useState(false);
  const [gazeVisual, setGazeVisual] = useState('jellyfish');

  // Music player state
  const [musicOpen, setMusicOpen] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);
  const audioRef2 = useRef(null); // Second audio element for crossfade
  const activeAudioRef = useRef(1); // Track which audio is currently active (1 or 2)
  const crossfadeRef = useRef(null); // Store crossfade interval

  // Crossfade duration in ms
  const CROSSFADE_DURATION = 3000;

  // Crossfade to a new track
  const crossfadeToTrack = useCallback((trackIndex) => {
    const track = musicTracks[trackIndex];
    if (!track) return;

    // Clear any existing crossfade
    if (crossfadeRef.current) {
      clearInterval(crossfadeRef.current);
    }

    const currentAudio = activeAudioRef.current === 1 ? audioRef.current : audioRef2.current;
    const nextAudio = activeAudioRef.current === 1 ? audioRef2.current : audioRef.current;

    if (!nextAudio) return;

    // Setup next audio
    nextAudio.src = track.file;
    nextAudio.volume = 0;
    nextAudio.play().catch(() => {});

    // Crossfade
    const steps = 30;
    const stepDuration = CROSSFADE_DURATION / steps;
    let step = 0;

    crossfadeRef.current = setInterval(() => {
      step++;
      const progress = step / steps;
      const fadeOut = 1 - progress;
      const fadeIn = progress;

      if (currentAudio && currentAudio.src) {
        currentAudio.volume = Math.max(0, fadeOut);
      }
      nextAudio.volume = Math.min(1, fadeIn);

      if (step >= steps) {
        clearInterval(crossfadeRef.current);
        crossfadeRef.current = null;
        if (currentAudio && currentAudio.src) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }
        activeAudioRef.current = activeAudioRef.current === 1 ? 2 : 1;
      }
    }, stepDuration);

    setCurrentTrack(trackIndex);
    setIsPlaying(true);
  }, []);

  // Stop with fadeout
  const stopWithFade = useCallback(() => {
    if (crossfadeRef.current) {
      clearInterval(crossfadeRef.current);
    }

    const currentAudio = activeAudioRef.current === 1 ? audioRef.current : audioRef2.current;
    if (!currentAudio) return;

    const steps = 20;
    const stepDuration = 1500 / steps;
    let step = 0;
    const startVolume = currentAudio.volume;

    crossfadeRef.current = setInterval(() => {
      step++;
      const progress = step / steps;
      currentAudio.volume = Math.max(0, startVolume * (1 - progress));

      if (step >= steps) {
        clearInterval(crossfadeRef.current);
        crossfadeRef.current = null;
        currentAudio.pause();
        currentAudio.currentTime = 0;
        setCurrentTrack(null);
        setIsPlaying(false);
      }
    }, stepDuration);
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (audioRef.current) audioRef.current.muted = newMuted;
    if (audioRef2.current) audioRef2.current.muted = newMuted;
  }, [isMuted]);

  // Autoplay music on app start
  useEffect(() => {
    if (audioRef.current && musicTracks.length > 0) {
      audioRef.current.src = musicTracks[0].file;
      audioRef.current.volume = 1;
      setCurrentTrack(0);

      const tryPlay = () => {
        if (audioRef.current && audioRef.current.paused) {
          audioRef.current.play()
            .then(() => setIsPlaying(true))
            .catch(() => {});
        }
      };

      // Try to play immediately
      tryPlay();

      // Also try on first user interaction (for browsers that block autoplay)
      const playOnInteraction = () => {
        tryPlay();
        // Remove all listeners once played
        ['touchstart', 'touchend', 'click', 'pointerdown', 'keydown', 'scroll'].forEach(event => {
          document.removeEventListener(event, playOnInteraction);
        });
      };

      // Listen for many types of interaction
      ['touchstart', 'touchend', 'click', 'pointerdown', 'keydown', 'scroll'].forEach(event => {
        document.addEventListener(event, playOnInteraction, { passive: true });
      });

      return () => {
        ['touchstart', 'touchend', 'click', 'pointerdown', 'keydown', 'scroll'].forEach(event => {
          document.removeEventListener(event, playOnInteraction);
        });
      };
    }
  }, []);

  // ============================================================================
  // SCROLL STATE
  // ============================================================================

  const [displayProgress, setDisplayProgress] = useState(0);
  const isAnimating = useRef(false);
  const touchHistory = useRef([]);
  const touchStartY = useRef(0);
  const lastTouchY = useRef(0);
  const containerRef = useRef(null);

  // Text reveal state (gentle fade-in)
  const [textRevealed, setTextRevealed] = useState(false);
  const revealTimeoutRef = useRef(null);

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

  // Get current theme and color
  const currentTheme = themes[settings.theme] || themes.void;
  const primaryHue = settings.primaryHue || 162;
  const primaryColor = `hsl(${primaryHue}, 52%, 68%)`;

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
    const savedMatch = !showSavedOnly || savedQuotes.some(s => s.author + '-' + s.text.substring(0, 30) === q.author + '-' + q.text.substring(0, 30));
    return schoolMatch && themeMatch && savedMatch;
  });

  const currentQuote = filteredQuotes[currentIndex % Math.max(filteredQuotes.length, 1)];
  const nextQuote = filteredQuotes[(currentIndex + 1) % Math.max(filteredQuotes.length, 1)];

  // ============================================================================
  // TEXT REVEAL - Gentle fade-in, no anxiety
  // ============================================================================

  useEffect(() => {
    if (!currentQuote) return;

    // Clear any existing timeout
    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current);
    }

    // Start hidden, then fade in after a brief moment
    setTextRevealed(false);
    revealTimeoutRef.current = setTimeout(() => {
      setTextRevealed(true);
    }, 100);

    return () => {
      if (revealTimeoutRef.current) {
        clearTimeout(revealTimeoutRef.current);
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
      // Turn off "saved only" filter if no more saved quotes
      if (newSaved.length === 0 && showSavedOnly) {
        setShowSavedOnly(false);
      }
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
        {/* Background visual for scroll mode - very dim, slow */}
        {(view === 'scroll' || view === 'filter') && (
          <GazeMode
            theme={currentTheme}
            primaryHue={settings.primaryHue}
            backgroundMode={true}
            currentVisual={gazeVisual}
          />
        )}

        {/* Vignette */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
          pointerEvents: 'none',
          zIndex: 1,
        }} />

        {/* Header - persistent across all views */}
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
            onClick={() => setTimeout(() => setShowColorOverlay(true), 80)}
            style={{
              fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
              fontFamily: '"Jost", sans-serif',
              fontWeight: 400,
              letterSpacing: '0.2em',
              margin: 0,
              cursor: 'pointer',
              color: currentTheme.text,
              opacity: 0.9,
              transition: 'opacity 0.5s ease',
            }}
          >
            STILL
          </h1>
          <nav style={{ display: 'flex', gap: '0.5rem' }}>
            {/* Main mode buttons - always visible */}
            {[
              { key: 'scroll', icon: '☰', label: 'Read' },
              { key: 'gaze', icon: '◯', label: 'Gaze' },
              { key: 'breathwork', icon: '◎', label: 'Breathe' },
            ].map(({ key, icon, label }) => {
              const isActive = key === 'scroll'
                ? (view === 'scroll' || view === 'filter')
                : view === key;
              return (
                <button
                  key={key}
                  onClick={() => setTimeout(() => setView(key), 80)}
                  style={{
                    background: isActive ? `hsla(${primaryHue}, 52%, 68%, 0.13)` : `${currentTheme.text}08`,
                    border: '1px solid',
                    borderColor: isActive ? `hsla(${primaryHue}, 52%, 68%, 0.27)` : currentTheme.border,
                    color: isActive ? primaryColor : currentTheme.textMuted,
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontFamily: '"Jost", sans-serif',
                    letterSpacing: '0.05em',
                    transition: 'all 0.5s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <span style={{ fontSize: '0.9rem' }}>{icon}</span>
                  <span className="nav-label">{label}</span>
                </button>
              );
            })}
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
                opacity: textRevealed ? 1 : 0,
                transform: textRevealed ? 'translateY(0)' : 'translateY(8px)',
                transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
              }}>
                {currentQuote.text}
              </blockquote>

              <div className="quote-meta" style={{
                marginTop: '2rem',
                transition: 'opacity 0.8s ease-out 0.3s, transform 0.8s ease-out 0.3s',
                opacity: textRevealed
                  ? Math.max(0, 1 - Math.abs(displayProgress) * 3)
                  : 0,
                transform: textRevealed ? 'translateY(0)' : 'translateY(8px)',
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
                    background: `hsla(${primaryHue}, 52%, 68%, 0.15)`,
                    borderRadius: '4px',
                    color: primaryColor,
                    fontSize: '0.7rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    border: `1px solid hsla(${primaryHue}, 52%, 68%, 0.25)`,
                  }}>
                    {currentQuote.school}
                  </span>
                  {currentQuote.themes && currentQuote.themes.slice(0, 2).map(theme => (
                    <span key={theme} style={{
                      padding: '0.25rem 0.6rem',
                      background: `hsla(${primaryHue}, 52%, 68%, 0.1)`,
                      borderRadius: '3px',
                      color: `hsla(${primaryHue}, 52%, 68%, 0.7)`,
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
                    onClick={() => setTimeout(() => toggleSave(currentQuote), 80)}
                    style={{
                      background: currentTheme.cardBg,
                      border: `1px solid ${currentTheme.border}`,
                      color: isQuoteSaved(currentQuote) ? primaryColor : currentTheme.textMuted,
                      padding: '0.75rem 1.25rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.5s ease',
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>{isQuoteSaved(currentQuote) ? '♥' : '♡'}</span>save
                  </button>
                  <button
                    onClick={() => setTimeout(() => setView('filter'), 80)}
                    style={{
                      background: currentTheme.cardBg,
                      border: `1px solid ${currentTheme.border}`,
                      color: (selectedSchools.size > 0 || selectedThemes.size > 0) ? primaryColor : currentTheme.textMuted,
                      padding: '0.75rem 1.25rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.5s ease',
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>◉</span>filter
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
                        transition: 'all 0.5s ease',
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
          <GazeMode
            theme={currentTheme}
            primaryHue={settings.primaryHue}
            onHueChange={(hue) => {
              const newSettings = { ...settings, primaryHue: hue };
              setSettings(newSettings);
              saveSettings(newSettings);
            }}
            currentVisual={gazeVisual}
            onVisualChange={setGazeVisual}
          />
        )}

        {/* Breathwork View - Dedicated breathing practice */}
        {view === 'breathwork' && (
          <BreathworkView
            breathSession={breathSession}
            breathTechniques={breathTechniques}
            startBreathSession={startBreathSession}
            stopBreathSession={stopBreathSession}
            primaryHue={primaryHue}
            primaryColor={primaryColor}
          />
        )}
        {false && view === 'breathwork-old' && (
          <main
            onClick={() => !breathSession.isActive && startBreathSession(breathSession.technique)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#000',
              cursor: 'pointer',
            }}
          >
            {/* Technique selector - horizontal scroll */}
            <div style={{
              position: 'absolute',
              top: '5rem',
              left: '50%',
              transform: 'translateX(-50%)',
              maxWidth: '85vw',
              overflowX: 'auto',
              overflowY: 'hidden',
              padding: '0.5rem',
              WebkitOverflowScrolling: 'touch',
            }}>
              <div style={{ display: 'flex', gap: '0.4rem', whiteSpace: 'nowrap' }}>
                {Object.entries(breathTechniques).map(([key, tech]) => (
                  <button
                    key={key}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (breathSession.isActive) stopBreathSession();
                      startBreathSession(key);
                    }}
                    style={{
                      background: breathSession.technique === key ? `hsla(${primaryHue}, 52%, 68%, 0.15)` : 'transparent',
                      border: breathSession.technique === key ? `1px solid hsla(${primaryHue}, 52%, 68%, 0.3)` : '1px solid rgba(255,255,255,0.08)',
                      color: breathSession.technique === key ? `hsl(${primaryHue}, 52%, 68%)` : 'rgba(255,255,255,0.4)',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.65rem',
                      fontFamily: '"Jost", sans-serif',
                      flexShrink: 0,
                    }}
                  >
                    {tech.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Pulsing circle */}
            <div style={{
              width: `${140 + (breathSession.isActive ? breathSession.phaseProgress : 0.5) * 100}px`,
              height: `${140 + (breathSession.isActive ? breathSession.phaseProgress : 0.5) * 100}px`,
              borderRadius: '50%',
              background: breathSession.phase === 'holdFull' || breathSession.phase === 'holdEmpty'
                ? 'radial-gradient(circle, rgba(255,215,100,0.12) 0%, rgba(255,215,100,0.04) 50%, transparent 70%)'
                : `radial-gradient(circle, hsla(${primaryHue}, 52%, 68%, 0.15) 0%, hsla(${primaryHue}, 52%, 68%, 0.05) 50%, transparent 70%)`,
              border: `1.5px solid ${breathSession.phase === 'holdFull' || breathSession.phase === 'holdEmpty' ? 'rgba(255,215,100,0.35)' : `hsla(${primaryHue}, 52%, 68%, 0.3)`}`,
              transition: 'width 0.15s ease-out, height 0.15s ease-out, background 0.3s ease, border-color 0.3s ease',
            }} />

            {/* Phase label */}
            <div style={{
              marginTop: '2.5rem',
              color: breathSession.phase === 'holdFull' || breathSession.phase === 'holdEmpty' ? 'rgba(255,215,100,0.8)' : `hsla(${primaryHue}, 52%, 68%, 0.7)`,
              fontSize: '0.9rem',
              fontFamily: '"Jost", sans-serif',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              transition: 'color 0.3s ease',
            }}>
              {breathSession.isActive
                ? breathTechniques[breathSession.technique]?.phases[breathSession.phaseIndex]?.label || ''
                : 'tap to begin'}
            </div>

            {/* Countdown */}
            {breathSession.isActive && (
              <div style={{
                marginTop: '1rem',
                color: 'rgba(255,255,255,0.25)',
                fontSize: '1.5rem',
                fontFamily: '"Jost", sans-serif',
                fontWeight: 300,
              }}>
                {Math.ceil(breathTechniques[breathSession.technique]?.phases[breathSession.phaseIndex]?.duration * (1 - breathSession.phaseProgress)) || ''}
              </div>
            )}
          </main>
        )}

        {/* Filter View */}
        {view === 'filter' && (
          <main style={{ position: 'absolute', top: '80px', left: 0, right: 0, bottom: 0, zIndex: 2, padding: '2rem', overflowY: 'auto' }}>
            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
              {/* Saved toggle */}
              <button
                onClick={() => setTimeout(() => setShowSavedOnly(!showSavedOnly), 80)}
                style={{
                  display: 'block',
                  margin: '0 auto 3rem',
                  background: 'transparent',
                  border: 'none',
                  color: showSavedOnly ? primaryColor : currentTheme.textMuted,
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  transition: 'all 0.5s ease',
                  opacity: showSavedOnly ? 1 : 0.6,
                  letterSpacing: '0.1em',
                }}
              >
                ♡ saved only
              </button>

              {/* Schools */}
              <h2 style={{ fontSize: '0.7rem', letterSpacing: '0.25em', color: currentTheme.textMuted, marginBottom: '1.5rem', textAlign: 'center', fontWeight: 400 }}>schools of thought</h2>
              {selectedSchools.size > 0 && (
                <button onClick={() => setTimeout(() => setSelectedSchools(new Set()), 80)} style={{ display: 'block', margin: '0 auto 1.5rem', background: 'none', border: 'none', color: `${primaryColor}80`, fontSize: '0.7rem', cursor: 'pointer', letterSpacing: '0.1em' }}>clear</button>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', marginBottom: '3rem' }}>
                {allSchools.map(school => {
                  const isSelected = selectedSchools.has(school);
                  return (
                    <button
                      key={school}
                      onClick={() => setTimeout(() => toggleSchool(school), 80)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: isSelected ? primaryColor : currentTheme.textMuted,
                        padding: '0.5rem 0.75rem',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        transition: 'all 0.5s ease',
                        opacity: isSelected ? 1 : 0.6,
                        letterSpacing: '0.05em',
                      }}
                    >
                      {school}
                    </button>
                  );
                })}
              </div>

              {/* Themes */}
              <h2 style={{ fontSize: '0.7rem', letterSpacing: '0.25em', color: currentTheme.textMuted, marginBottom: '1.5rem', textAlign: 'center', fontWeight: 400 }}>themes</h2>
              {selectedThemes.size > 0 && (
                <button onClick={() => setTimeout(() => setSelectedThemes(new Set()), 80)} style={{ display: 'block', margin: '0 auto 1.5rem', background: 'none', border: 'none', color: `${primaryColor}80`, fontSize: '0.7rem', cursor: 'pointer', letterSpacing: '0.1em' }}>clear</button>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'center' }}>
                {allThemes.map(theme => {
                  const isSelected = selectedThemes.has(theme);
                  return (
                    <button
                      key={theme}
                      onClick={() => setTimeout(() => toggleTheme(theme), 80)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: isSelected ? primaryColor : currentTheme.textMuted,
                        padding: '0.4rem 0.6rem',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        transition: 'all 0.5s ease',
                        opacity: isSelected ? 1 : 0.5,
                        letterSpacing: '0.03em',
                      }}
                    >
                      {theme}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setTimeout(() => setView('scroll'), 80)}
                style={{
                  display: 'block',
                  margin: '3rem auto 0',
                  background: 'transparent',
                  border: 'none',
                  color: currentTheme.textMuted,
                  padding: '1rem 2rem',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  letterSpacing: '0.15em',
                  transition: 'all 0.5s ease',
                }}
              >
                return
              </button>
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
            animation: 'fadeIn 0.5s ease',
          }}>
            {toast}
          </div>
        )}

        {/* Music Player - minimal */}
        {musicTracks.length > 0 && (
          <>
            {/* Hidden audio elements for crossfade */}
            <audio
              ref={audioRef}
              onPlay={() => setIsPlaying(true)}
              onPause={() => { if (activeAudioRef.current === 1 && !crossfadeRef.current) setIsPlaying(false); }}
              onEnded={() => { if (activeAudioRef.current === 1 && currentTrack !== null) crossfadeToTrack((currentTrack + 1) % musicTracks.length); }}
            />
            <audio
              ref={audioRef2}
              onPlay={() => setIsPlaying(true)}
              onPause={() => { if (activeAudioRef.current === 2 && !crossfadeRef.current) setIsPlaying(false); }}
              onEnded={() => { if (activeAudioRef.current === 2 && currentTrack !== null) crossfadeToTrack((currentTrack + 1) % musicTracks.length); }}
            />

            {/* Music toggle button */}
            <button
              onClick={() => setTimeout(() => setMusicOpen(!musicOpen), 80)}
              style={{
                position: 'fixed',
                bottom: '1.5rem',
                left: '1.5rem',
                width: '36px',
                height: '36px',
                background: musicOpen ? `hsla(${primaryHue}, 52%, 68%, 0.15)` : 'rgba(255,255,255,0.05)',
                border: `1px solid ${musicOpen ? `hsla(${primaryHue}, 52%, 68%, 0.3)` : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '50%',
                color: isPlaying ? primaryColor : 'rgba(255,255,255,0.4)',
                fontSize: '1rem',
                cursor: 'pointer',
                zIndex: 150,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.4s ease',
              }}
            >
              {isPlaying ? '♪' : '♫'}
            </button>

            {/* Track list */}
            {musicOpen && (
              <div style={{
                position: 'fixed',
                bottom: '4.5rem',
                left: '1.5rem',
                background: 'rgba(0,0,0,0.9)',
                border: `1px solid rgba(255,255,255,0.1)`,
                borderRadius: '8px',
                padding: '0.5rem',
                zIndex: 150,
                minWidth: '140px',
                animation: 'fadeIn 0.5s ease',
              }}>
                {/* Stop button */}
                {isPlaying && (
                  <button
                    onClick={stopWithFade}
                    style={{
                      display: 'block',
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255,255,255,0.5)',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.75rem',
                      fontFamily: '"Jost", sans-serif',
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    ◼ Stop
                  </button>
                )}
                {/* Mute button */}
                {isPlaying && (
                  <button
                    onClick={toggleMute}
                    style={{
                      display: 'block',
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      color: isMuted ? primaryColor : 'rgba(255,255,255,0.5)',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.75rem',
                      fontFamily: '"Jost", sans-serif',
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {isMuted ? '◦ unmute' : '• mute'}
                  </button>
                )}
                {musicTracks.map((track, i) => (
                  <button
                    key={track.file}
                    onClick={() => {
                      crossfadeToTrack(i);
                      setMusicOpen(false);
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      background: currentTrack === i ? `hsla(${primaryHue}, 52%, 68%, 0.1)` : 'none',
                      border: 'none',
                      color: currentTrack === i ? primaryColor : 'rgba(255,255,255,0.6)',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.75rem',
                      fontFamily: '"Jost", sans-serif',
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {currentTrack === i && isPlaying ? '▶ ' : ''}{track.name}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Color Overlay - triggered by tapping STILL logo */}
        {showColorOverlay && (
          <div
            onClick={() => setShowColorOverlay(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.92)',
              zIndex: 300,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2.5rem',
              animation: 'colorOverlayIn 0.6s ease-out',
            }}
          >
            {COLOR_PRESETS.map((preset, i) => (
              <button
                key={preset.hue}
                onClick={(e) => {
                  e.stopPropagation();
                  const newSettings = { ...settings, primaryHue: preset.hue };
                  setSettings(newSettings);
                  saveSettings(newSettings);
                  setTimeout(() => setShowColorOverlay(false), 500);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: primaryHue === preset.hue
                    ? `hsl(${preset.hue}, 52%, 68%)`
                    : 'rgba(255, 255, 255, 0.25)',
                  fontSize: '1.1rem',
                  fontFamily: '"Jost", sans-serif',
                  fontWeight: 300,
                  letterSpacing: '0.3em',
                  textTransform: 'lowercase',
                  cursor: 'pointer',
                  padding: '0.5rem 1rem',
                  transition: 'all 0.5s ease',
                  opacity: 0,
                  animation: `colorWordIn 0.6s ease-out ${0.1 + i * 0.08}s forwards`,
                }}
              >
                {preset.name}
              </button>
            ))}
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
          @keyframes colorOverlayIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes colorWordIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
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

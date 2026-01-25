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
  { text: "The higher we soar, the smaller we appear to those who cannot fly.", author: "Friedrich Nietzsche", school: "Existentialism", era: "19th Century", themes: ["self", "courage"] },
  { text: "You must have chaos within you to give birth to a dancing star.", author: "Friedrich Nietzsche", school: "Existentialism", era: "19th Century", themes: ["change", "joy"] },
  { text: "Man is condemned to be free.", author: "Jean-Paul Sartre", school: "Existentialism", era: "20th Century", themes: ["freedom", "meaning"] },
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
  { text: "The absurd is born of this confrontation between the human need and the unreasonable silence of the world.", author: "Albert Camus", school: "Absurdism", era: "20th Century", themes: ["truth", "meaning"] },

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
};

const ThemeContext = createContext(themes.void);

// ============================================================================
// BREATHWORK TECHNIQUES
// ============================================================================

const breathTechniques = {
  calm: {
    name: 'Gentle Calm',
    description: 'Simple, soothing rhythm',
    recommendedCycles: 8, // ~1.5 min - gentle intro
    phases: [
      { name: 'inhale', label: 'inhale', duration: 5 },
      { name: 'exhale', label: 'exhale', duration: 6 },
    ],
    color: { inhale: '#1a3a4a', exhale: '#2a3a4a' },
  },
  relaxation: {
    name: '4-7-8 Sleep',
    description: 'Deep relaxation for sleep',
    recommendedCycles: 4, // Dr. Weil: max 4 cycles for beginners
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
    recommendedCycles: 15, // ~3 min - HRV research suggests 5-10 min
    phases: [
      { name: 'inhale', label: 'inhale', duration: 6 },
      { name: 'exhale', label: 'exhale', duration: 6 },
    ],
    color: { inhale: '#1a4a4a', exhale: '#2a3a5a' },
  },
  box: {
    name: 'Box Breathing',
    description: 'Navy SEAL calm focus',
    recommendedCycles: 8, // ~2 min - Navy SEAL standard session
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
    recommendedCycles: 10, // ~2 min - parasympathetic activation
    phases: [
      { name: 'inhale', label: 'inhale', duration: 4 },
      { name: 'exhale', label: 'exhale slowly', duration: 8 },
    ],
    color: { inhale: '#1a3a4a', exhale: '#2a2a4a' },
  },
  ocean: {
    name: 'Ocean Breath',
    description: 'Slow, wave-like rhythm',
    recommendedCycles: 8, // ~2.4 min - Ujjayi pranayama
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
    recommendedCycles: 15, // ~2.5 min - HRV training
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
    recommendedCycles: 10, // Huberman: 5 min for lasting benefit
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
    recommendedCycles: 10, // ~2 min
    phases: [
      { name: 'inhale', label: 'Inhale', duration: 4 },
      { name: 'exhale', label: 'Slow exhale', duration: 8 },
    ],
    color: { inhale: '#1a3a4a', exhale: '#1a2a3a' },
  },

  fourSixBreath: {
    name: '4-6 Anxiety Relief',
    description: 'Quick parasympathetic shift',
    recommendedCycles: 10, // ~1.6 min - quick relief
    phases: [
      { name: 'inhale', label: 'Inhale', duration: 4 },
      { name: 'exhale', label: 'Exhale', duration: 6 },
    ],
    color: { inhale: '#2a3a4a', exhale: '#1a2a4a' },
  },

  deepBelly: {
    name: 'Diaphragmatic',
    description: 'Deep belly breathing',
    recommendedCycles: 8, // ~1.7 min
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
    recommendedCycles: 8, // ~1.2 min - acute relief
    phases: [
      { name: 'inhale', label: 'Nose inhale', duration: 3 },
      { name: 'exhale', label: 'Pursed lips out', duration: 6 },
    ],
    color: { inhale: '#2a3a4a', exhale: '#1a2a4a' },
  },

  vagalTone: {
    name: 'Vagal Toning',
    description: 'Activates vagus nerve',
    recommendedCycles: 6, // ~1.8 min - vagus activation
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
    recommendedCycles: 5, // ~2 min - traditional practice
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
    recommendedCycles: 30, // 5 min as prescribed by the method
    phases: [
      { name: 'inhale', label: 'Inhale', duration: 5 },
      { name: 'exhale', label: 'Exhale', duration: 5 },
    ],
    color: { inhale: '#2a4a4a', exhale: '#1a3a4a' },
  },

  softBelly: {
    name: 'Soft Belly',
    description: 'Mindful belly softening',
    recommendedCycles: 10, // ~1.6 min
    phases: [
      { name: 'inhale', label: 'Soft...', duration: 4 },
      { name: 'exhale', label: 'Belly...', duration: 6 },
    ],
    color: { inhale: '#2a3a3a', exhale: '#1a2a3a' },
  },

  cooling: {
    name: 'Sitali Cooling',
    description: 'Cools body and mind',
    recommendedCycles: 8, // ~1.6 min
    phases: [
      { name: 'inhale', label: 'Roll tongue, inhale through mouth', duration: 4 },
      { name: 'holdFull', label: 'Hold', duration: 2 },
      { name: 'exhale', label: 'Nose exhale', duration: 6 },
    ],
    color: { inhale: '#1a4a5a', holdFull: '#2a5a5a', exhale: '#1a3a4a' },
  },

  moonBreath: {
    name: 'Chandra Bhedana',
    description: 'Left nostril only - calming',
    recommendedCycles: 8, // ~1.6 min
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
    recommendedCycles: 8, // ~1.9 min
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
    recommendedCycles: 8, // ~1.6 min
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
    recommendedCycles: 8, // ~2 min
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

// ============================================================================
// HAPTIC FEEDBACK - Subtle vibration patterns for key moments
// ============================================================================
const haptic = {
  // Check if vibration is supported
  supported: typeof navigator !== 'undefined' && 'vibrate' in navigator,

  // Gentle tap for UI interactions
  tap: () => haptic.supported && navigator.vibrate(10),

  // Soft pulse for breath phase start
  soft: () => haptic.supported && navigator.vibrate(15),

  // Medium pulse for transitions
  medium: () => haptic.supported && navigator.vibrate(25),

  // Double tap for hold phases
  double: () => haptic.supported && navigator.vibrate([12, 50, 12]),

  // Success pattern for session complete
  success: () => haptic.supported && navigator.vibrate([15, 80, 15, 80, 30]),

  // Inhale pattern - gentle rising
  inhale: () => haptic.supported && navigator.vibrate(20),

  // Exhale pattern - soft release
  exhale: () => haptic.supported && navigator.vibrate(15),

  // Hold pattern - subtle reminder
  hold: () => haptic.supported && navigator.vibrate([8, 60, 8]),
};

const gazeModes = [
  { key: 'geometry', name: 'Torus' },
  { key: 'tree', name: 'Fractal Tree' },
  { key: 'fern', name: 'Fern' },
  { key: 'succulent', name: 'Succulent' },
  { key: 'dandelion', name: 'Dandelion' },
  { key: 'lungs', name: 'Breath Tree' },
  { key: 'ripples', name: 'Ripples' },
  { key: 'jellyfish', name: 'Jellyfish 3D' },
  { key: 'jellyfish2d', name: 'Deep Sea' },
  { key: 'mushrooms', name: 'Mushrooms' },
  // Water/Ocean visuals
  { key: 'koiPond', name: 'Koi Pond' },
  { key: 'bioluminescent', name: 'Bioluminescent' },
  // Mathematical/Topological visuals
  { key: 'flowerOfLife', name: 'Flower of Life' },
  // Organic/Abstract visuals
  { key: 'wax', name: 'Lava Lamp' },
  // Hyperdimensional visuals
  { key: 'realm', name: 'Realm' },
];

// Filtered visuals for breathwork mode (excludes busy visuals that interfere with text)
const breathworkModes = gazeModes.filter(m =>
  !['fern', 'succulent', 'ripples', 'jellyfish', 'jellyfish2d', 'mushrooms', 'koiPond', 'flowerOfLife', 'dandelion', 'bioluminescent', 'realm', 'tree'].includes(m.key)
);

const gazeShapes = [
  { key: 'torus', name: 'Torus', create: () => new THREE.TorusGeometry(1, 0.4, 16, 100) },
  { key: 'torusKnot', name: 'Knot', create: () => new THREE.TorusKnotGeometry(0.7, 0.25, 100, 16) },
];

// Breath cycle: 5s inhale, 6s exhale = ~5.5 breaths/min (parasympathetic optimal)
const BREATH_CYCLE = 11; // seconds for full cycle
const BREATH_SPEED = (2 * Math.PI) / BREATH_CYCLE;

// Mobile optimization
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
const MOBILE_SPEED = isMobile ? 0.6 : 1;  // Slower animations on mobile
const MOBILE_PARTICLES = isMobile ? 0.4 : 1;  // Fewer particles on mobile
const MOBILE_PIXEL_RATIO = isMobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2);

function GazeMode({ theme, primaryHue = 162, onHueChange, backgroundMode = false, currentVisual, onVisualChange, breathSession = null, externalTouchRef = null }) {
  // Use primaryHue throughout for consistent color scheme
  const hue = primaryHue;
  // Background mode: dimmer, slower, no interaction
  const bgOpacity = 1; // Always full opacity
  const bgSpeed = backgroundMode ? 0.3 : 1;
  const containerRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const frameRef = React.useRef(null);
  const sceneRef = React.useRef(null);
  const rendererRef = React.useRef(null);
  const meshRef = React.useRef(null);
  const clockRef = React.useRef(null);

  // Spring physics for fluid breathing animation
  const scaleRef = React.useRef(1);
  const scaleVelocityRef = React.useRef(0);

  // Keep external breathSession prop in a ref for access in animation loops
  const externalBreathSessionRef = React.useRef(breathSession);
  externalBreathSessionRef.current = breathSession;

  // Use prop if provided, otherwise use internal state
  const [internalMode, setInternalMode] = React.useState('geometry');
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
  const [breathDisplay, setBreathDisplay] = React.useState({ phase: 0.5, phaseLabel: 'inhale', isHolding: false });

  // ========== TOUCH INTERACTION SYSTEM ==========
  const touchPointsRef = React.useRef([]);
  const ripplesRef = React.useRef([]);
  const swipeStartRef = React.useRef(null);
  const wheelAccumRef = React.useRef(0);
  const wheelTimeoutRef = React.useRef(null);

  // Merge external touches (from parent component like DroneMode)
  React.useEffect(() => {
    if (!externalTouchRef) return;
    const interval = setInterval(() => {
      const touches = externalTouchRef.current || [];
      touches.forEach(touch => {
        const existing = touchPointsRef.current.find(p => p.id === touch.id);
        if (!existing) {
          touchPointsRef.current.push({
            id: touch.id,
            x: touch.x,
            y: touch.y,
            startX: touch.x,
            startY: touch.y,
            velocity: { x: 0, y: 0 },
            active: true,
            startTime: Date.now(),
          });
          // Create ripple for external touches
          ripplesRef.current.push({
            x: touch.x,
            y: touch.y,
            startTime: Date.now(),
            duration: 1500,
            maxRadius: 100,
          });
        }
      });
      // Mark old external touches as inactive
      externalTouchRef.current = touches.filter(t => Date.now() - t.time < 100);
    }, 16);
    return () => clearInterval(interval);
  }, [externalTouchRef]);

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
    haptic.tap(); // Haptic feedback on visual change
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

      // DISABLED: Swipe-up menu removed for minimal experience (left/right swipe only)
      // Uncomment to re-enable swipe-up menu:
      // // Detect vertical swipe UP: open mode selector (swipe must start in bottom third of screen)
      // const screenHeight = window.innerHeight;
      // if (deltaY < -minSwipeDistance && Math.abs(deltaY) > Math.abs(deltaX) * 1.5 && deltaTime < maxSwipeTime) {
      //   if (swipeStartRef.current.y > screenHeight * 0.5) { // Started in bottom half
      //     setShowUI(true);
      //     swipeStartRef.current = null;
      //     return;
      //   }
      // }
      //
      // // Detect vertical swipe DOWN: close mode selector
      // if (deltaY > minSwipeDistance && Math.abs(deltaY) > Math.abs(deltaX) * 1.5 && deltaTime < maxSwipeTime && showUI) {
      //   setShowUI(false);
      //   swipeStartRef.current = null;
      //   return;
      // }

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
  const backgroundModeRef = React.useRef(backgroundMode);
  backgroundModeRef.current = backgroundMode;
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
      // DISABLED: Swipe-up menu removed for minimal experience
      // // Vertical swipe UP = open menu
      // else if (wheelAccumRef.current > threshold) {
      //   e.preventDefault();
      //   setShowUI(true);
      //   wheelAccumRef.current = 0;
      // }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [backgroundMode, cycleVisual]);

  // Window-level touch event listeners for reliable mobile touch handling
  React.useEffect(() => {
    const handleWindowTouchStart = (e) => {
      if (backgroundModeRef.current || showUIRef.current) return;
      const touches = Array.from(e.touches);

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
          ripplesRef.current.push({
            x: touch.clientX,
            y: touch.clientY,
            startTime: Date.now(),
            maxRadius: 150,
            duration: 1000,
          });
        }
      });
    };

    const handleWindowTouchMove = (e) => {
      if (backgroundModeRef.current || showUIRef.current) return;
      const touches = Array.from(e.touches);
      touches.forEach(touch => {
        const point = touchPointsRef.current.find(p => p.id === touch.identifier);
        if (point) {
          point.velocity.x = touch.clientX - point.x;
          point.velocity.y = touch.clientY - point.y;
          point.x = touch.clientX;
          point.y = touch.clientY;
        }
      });
    };

    const handleWindowTouchEnd = (e) => {
      if (backgroundModeRef.current) return;
      const touches = Array.from(e.changedTouches);

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
          cycleVisual(deltaX > 0 ? -1 : 1);
          swipeStartRef.current = null;
          return;
        }

        // DISABLED: Swipe-up menu removed for minimal experience
        // // Detect vertical swipe UP: open mode selector
        // const screenHeight = window.innerHeight;
        // if (deltaY < -minSwipeDistance && Math.abs(deltaY) > Math.abs(deltaX) * 1.5 && deltaTime < maxSwipeTime) {
        //   if (swipeStartRef.current.y > screenHeight * 0.5) {
        //     setShowUI(true);
        //     swipeStartRef.current = null;
        //     return;
        //   }
        // }
        //
        // // Detect vertical swipe DOWN: close mode selector
        // if (deltaY > minSwipeDistance && Math.abs(deltaY) > Math.abs(deltaX) * 1.5 && deltaTime < maxSwipeTime && showUIRef.current) {
        //   setShowUI(false);
        //   swipeStartRef.current = null;
        //   return;
        // }

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
    };

    window.addEventListener('touchstart', handleWindowTouchStart, { passive: true });
    window.addEventListener('touchmove', handleWindowTouchMove, { passive: true });
    window.addEventListener('touchend', handleWindowTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleWindowTouchStart);
      window.removeEventListener('touchmove', handleWindowTouchMove);
      window.removeEventListener('touchend', handleWindowTouchEnd);
    };
  }, [cycleVisual]);

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
      return { phase, phaseName: phase > 0.5 ? 'inhale' : 'exhale', phaseLabel: phase > 0.5 ? 'inhale' : 'exhale', isInhaling: phase > 0.5 };
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
    return { phase: 0.5, phaseName: 'inhale', phaseLabel: 'inhale', isInhaling: true };
  }, [selectedTechnique]);

  // Simple phase getter for visuals (returns 0-1)
  // When breathSession is provided (from BreathworkView), use it instead of internal timing
  const getBreathPhase = React.useCallback((elapsed) => {
    // Use external breathSession if provided and active (access via ref for animation loops)
    const session = externalBreathSessionRef.current;
    if (session && session.isActive) {
      const { phase, phaseProgress } = session;
      // Convert phase name to visual phase (0-1)
      if (phase === 'inhale') {
        return phaseProgress; // 0 -> 1
      } else if (phase === 'holdFull') {
        return 1;
      } else if (phase === 'exhale') {
        return 1 - phaseProgress; // 1 -> 0
      } else if (phase === 'holdEmpty') {
        return 0;
      }
      return 0.5;
    }
    // Otherwise use internal breath calculation
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
    camera.position.z = 5.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'none';
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
        // Touch-responsive rotation
        if (touchPointsRef.current.length > 0) {
          const activeTouch = touchPointsRef.current.find(p => p.active) || touchPointsRef.current[0];
          if (activeTouch) {
            const normalizedX = (activeTouch.x / window.innerWidth - 0.5) * 2;
            const normalizedY = (activeTouch.y / window.innerHeight - 0.5) * 2;
            meshRef.current.rotation.y += normalizedX * 0.02;
            meshRef.current.rotation.x += normalizedY * 0.02;
          }
        } else {
          // Gentle auto-rotation when not touching
          meshRef.current.rotation.y += 0.001;
          meshRef.current.rotation.x += 0.0005;
        }

        // Spring-damper scale physics (fluid, not robotic)
        const targetScale = 0.85 + breath * 0.35;
        const springStiffness = 0.015;
        const damping = 0.85;
        const force = (targetScale - scaleRef.current) * springStiffness;
        scaleVelocityRef.current = scaleVelocityRef.current * damping + force;
        scaleRef.current += scaleVelocityRef.current;
        meshRef.current.scale.setScalar(scaleRef.current);

        // Z-position breathing (moves toward viewer on inhale)
        const zOffset = (scaleRef.current - 0.85) * 2.3 - 0.3;
        meshRef.current.position.z = zOffset;

        // Opacity synced to scale
        meshRef.current.material.opacity = 0.4 + scaleRef.current * 0.4;
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

  // ========== FRACTAL TREE MODE (3D) ==========
  React.useEffect(() => {
    if (currentMode !== 'tree' || !containerRef.current || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2.5, 7);
    camera.lookAt(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'none';
    rendererRef.current = renderer;
    clockRef.current = new THREE.Clock();

    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };

    const treeGroup = new THREE.Group();
    scene.add(treeGroup);

    const branches = [];
    const leaves = [];

    // Recursive branch creation - organic, contemplative
    const createBranch = (startPos, direction, length, depth, maxDepth) => {
      if (depth > maxDepth || length < 0.05) return;

      const endPos = startPos.clone().add(direction.clone().multiplyScalar(length));

      // Wireframe branches for ethereal feel
      const branchGeom = new THREE.CylinderGeometry(
        0.015 * (maxDepth - depth + 1) * 0.4,
        0.02 * (maxDepth - depth + 1) * 0.4,
        length,
        6
      );

      const t = depth / maxDepth;
      const branchMat = new THREE.MeshBasicMaterial({
        color: hslToHex(hue, 35 + t * 25, 30 + t * 30),
        transparent: true,
        opacity: 0.5 + t * 0.2,
        wireframe: true
      });

      const branch = new THREE.Mesh(branchGeom, branchMat);
      const midPoint = startPos.clone().add(endPos).multiplyScalar(0.5);
      branch.position.copy(midPoint);
      branch.lookAt(endPos);
      branch.rotateX(Math.PI / 2);
      branch.userData = { depth, phase: Math.random() * Math.PI * 2 };
      treeGroup.add(branch);
      branches.push(branch);

      // Ethereal leaf orbs at tips
      if (depth >= maxDepth - 2) {
        const leafGeom = new THREE.SphereGeometry(0.06 + Math.random() * 0.03, 8, 8);
        const leafMat = new THREE.MeshBasicMaterial({
          color: hslToHex(hue, 55, 55),
          transparent: true,
          opacity: 0.4
        });
        const leaf = new THREE.Mesh(leafGeom, leafMat);
        leaf.position.copy(endPos);
        leaf.userData = { phase: Math.random() * Math.PI * 2 };
        treeGroup.add(leaf);
        leaves.push(leaf);
      }

      // Organic branching
      const branchAngle = 0.45 + Math.random() * 0.25;
      const newLength = length * (0.68 + Math.random() * 0.12);

      const leftDir = direction.clone();
      leftDir.applyAxisAngle(new THREE.Vector3(0, 0, 1), branchAngle);
      leftDir.applyAxisAngle(new THREE.Vector3(1, 0, 0), (Math.random() - 0.5) * 0.4);
      createBranch(endPos.clone(), leftDir, newLength, depth + 1, maxDepth);

      const rightDir = direction.clone();
      rightDir.applyAxisAngle(new THREE.Vector3(0, 0, 1), -branchAngle);
      rightDir.applyAxisAngle(new THREE.Vector3(1, 0, 0), (Math.random() - 0.5) * 0.4);
      createBranch(endPos.clone(), rightDir, newLength, depth + 1, maxDepth);
    };

    createBranch(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), 1.4, 0, 6);

    // Spring physics state for this visualization
    let localScale = 1;
    let localScaleVelocity = 0;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = clockRef.current.getElapsedTime();
      const breath = getBreathPhase(elapsed);

      // Touch-responsive rotation
      if (touchPointsRef.current.length > 0) {
        const activeTouch = touchPointsRef.current.find(p => p.active) || touchPointsRef.current[0];
        if (activeTouch) {
          const normalizedX = (activeTouch.x / window.innerWidth - 0.5) * 2;
          const normalizedY = (activeTouch.y / window.innerHeight - 0.5) * 2;
          treeGroup.rotation.y += normalizedX * 0.02;
          treeGroup.rotation.x += normalizedY * 0.01;
        }
      } else {
        // Gentle auto-rotation when not touching
        treeGroup.rotation.y += 0.001;
      }

      // Spring-damper scale physics
      const targetScale = 0.9 + breath * 0.2;
      const springStiffness = 0.015;
      const damping = 0.85;
      const force = (targetScale - localScale) * springStiffness;
      localScaleVelocity = localScaleVelocity * damping + force;
      localScale += localScaleVelocity;
      treeGroup.scale.setScalar(localScale);

      // Z-position breathing
      const zOffset = (localScale - 0.9) * 2.0;
      treeGroup.position.z = zOffset;

      // Branches sway like they're underwater
      branches.forEach(branch => {
        const sway = Math.sin(elapsed * 0.3 + branch.userData.depth * 0.2 + branch.userData.phase) * 0.008 * branch.userData.depth;
        branch.rotation.z += sway * 0.1;
        // Opacity synced to breath
        branch.material.opacity = 0.5 + localScale * 0.4;
      });

      // Leaves pulse with breath
      leaves.forEach(leaf => {
        const pulse = 0.9 + Math.sin(elapsed * 0.8 + leaf.userData.phase) * 0.1;
        leaf.scale.setScalar(pulse + breath * 0.15);
        leaf.material.opacity = 0.3 + localScale * 0.4;
      });

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
      branches.forEach(b => { b.geometry.dispose(); b.material.dispose(); });
      leaves.forEach(l => { l.geometry.dispose(); l.material.dispose(); });
      renderer.dispose();
    };
  }, [currentMode, hue, getBreathPhase]);

  // ========== RIPPLES MODE (3D) ==========
  React.useEffect(() => {
    if (currentMode !== 'ripples' || !containerRef.current || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 4, 6);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'none';
    rendererRef.current = renderer;
    clockRef.current = new THREE.Clock();

    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };

    const rippleGroup = new THREE.Group();
    scene.add(rippleGroup);

    // Central breathing sphere
    const coreGeom = new THREE.SphereGeometry(0.3, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: hslToHex(hue, 55, 55),
      transparent: true,
      opacity: 0.6,
      wireframe: true
    });
    const core = new THREE.Mesh(coreGeom, coreMat);
    rippleGroup.add(core);

    // Ripple rings (torus shapes)
    const ripples = [];
    const maxRipples = 8;
    let lastBreathPeak = 0;

    const createRipple = () => {
      const rippleGeom = new THREE.TorusGeometry(0.1, 0.02, 8, 64);
      const rippleMat = new THREE.MeshBasicMaterial({
        color: hslToHex(hue, 50, 60),
        transparent: true,
        opacity: 0.6,
        wireframe: true
      });
      const ripple = new THREE.Mesh(rippleGeom, rippleMat);
      ripple.rotation.x = Math.PI / 2;
      ripple.userData = { born: clockRef.current.getElapsedTime(), maxAge: 12 };
      rippleGroup.add(ripple);
      ripples.push(ripple);

      if (ripples.length > maxRipples) {
        const old = ripples.shift();
        rippleGroup.remove(old);
        old.geometry.dispose();
        old.material.dispose();
      }
    };

    createRipple();

    // Spring physics state
    let localScale = 1;
    let localScaleVelocity = 0;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = clockRef.current.getElapsedTime() * bgSpeed;
      const breath = getBreathPhase(elapsed);

      // Spawn ripple at breath peak (less frequently in background mode)
      const spawnInterval = backgroundMode ? 16 : 8;
      if (breath > 0.95 && elapsed - lastBreathPeak > spawnInterval) {
        createRipple();
        lastBreathPeak = elapsed;
      }

      // Touch creates ripples
      touchPointsRef.current.forEach(point => {
        if (point.active && !point.rippleSpawned) {
          createRipple();
          point.rippleSpawned = true;
        }
      });

      // Touch-responsive rotation (slower in background mode)
      if (touchPointsRef.current.length > 0) {
        const activeTouch = touchPointsRef.current.find(p => p.active) || touchPointsRef.current[0];
        if (activeTouch) {
          const normalizedX = (activeTouch.x / window.innerWidth - 0.5) * 2;
          const normalizedY = (activeTouch.y / window.innerHeight - 0.5) * 2;
          rippleGroup.rotation.y += normalizedX * 0.02 * bgSpeed;
          rippleGroup.rotation.x += normalizedY * 0.01 * bgSpeed;
        }
      } else {
        rippleGroup.rotation.y += 0.0003 * bgSpeed;
      }

      // Spring-damper scale physics for core (gentler in background mode)
      const targetScale = 0.85 + breath * 0.35;
      const springStiffness = backgroundMode ? 0.005 : 0.015;
      const damping = backgroundMode ? 0.92 : 0.85;
      const force = (targetScale - localScale) * springStiffness;
      localScaleVelocity = localScaleVelocity * damping + force;
      localScale += localScaleVelocity;
      core.scale.setScalar(localScale);
      coreMat.opacity = 0.4 + localScale * 0.4;

      // Z-position breathing
      const zOffset = (localScale - 0.85) * 2.0;
      rippleGroup.position.z = zOffset;

      // Animate ripples expanding outward (slower in background mode)
      const realElapsed = clockRef.current.getElapsedTime();
      ripples.forEach(ripple => {
        const age = (realElapsed - ripple.userData.born) * bgSpeed;
        const progress = age / ripple.userData.maxAge;

        if (progress < 1) {
          const radius = 0.3 + progress * 4;
          ripple.scale.set(radius / 0.1, radius / 0.1, 1);
          ripple.material.opacity = (1 - progress) * 0.5;
          ripple.position.y = Math.sin(progress * Math.PI) * 0.3;
        }
      });

      // Clean up old ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const age = (realElapsed - ripples[i].userData.born) * bgSpeed;
        if (age > ripples[i].userData.maxAge) {
          rippleGroup.remove(ripples[i]);
          ripples[i].geometry.dispose();
          ripples[i].material.dispose();
          ripples.splice(i, 1);
        }
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
      coreGeom.dispose(); coreMat.dispose();
      ripples.forEach(r => { r.geometry.dispose(); r.material.dispose(); });
      renderer.dispose();
    };
  }, [currentMode, hue, getBreathPhase]);

  // ========== FERN MODE (3D Barnsley Fern) ==========
  React.useEffect(() => {
    if (currentMode !== 'fern' || !containerRef.current || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2.5, 6);
    camera.lookAt(0, 2.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'none';
    rendererRef.current = renderer;
    clockRef.current = new THREE.Clock();

    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };

    const fernGroup = new THREE.Group();
    scene.add(fernGroup);

    // Barnsley fern transformation matrices
    const transforms = [
      { a: 0, b: 0, c: 0, d: 0.16, e: 0, f: 0, p: 0.01 },
      { a: 0.85, b: 0.04, c: -0.04, d: 0.85, e: 0, f: 1.6, p: 0.85 },
      { a: 0.2, b: -0.26, c: 0.23, d: 0.22, e: 0, f: 1.6, p: 0.07 },
      { a: -0.15, b: 0.28, c: 0.26, d: 0.24, e: 0, f: 0.44, p: 0.07 },
    ];

    // Generate fern points
    const pointCount = 15000;
    const positions = new Float32Array(pointCount * 3);
    const colors = new Float32Array(pointCount * 3);
    let x = 0, y = 0;

    for (let i = 0; i < pointCount; i++) {
      const r = Math.random();
      let t;
      if (r < transforms[0].p) t = transforms[0];
      else if (r < transforms[0].p + transforms[1].p) t = transforms[1];
      else if (r < transforms[0].p + transforms[1].p + transforms[2].p) t = transforms[2];
      else t = transforms[3];

      const nx = t.a * x + t.b * y + t.e;
      const ny = t.c * x + t.d * y + t.f;
      x = nx; y = ny;

      // Scale and position
      const scale = 0.5;
      positions[i * 3] = x * scale + (Math.random() - 0.5) * 0.02;
      positions[i * 3 + 1] = y * scale;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3;

      // Color based on height
      const heightRatio = y / 10;
      const color = new THREE.Color().setHSL(hue / 360, 0.4 + heightRatio * 0.2, 0.35 + heightRatio * 0.25);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const fernGeom = new THREE.BufferGeometry();
    fernGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    fernGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const fernMat = new THREE.PointsMaterial({
      size: 0.025,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });

    const fern = new THREE.Points(fernGeom, fernMat);
    fernGroup.add(fern);

    // Spring physics state
    let localScale = 1;
    let localScaleVelocity = 0;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = clockRef.current.getElapsedTime();
      const breath = getBreathPhase(elapsed);

      // Touch-responsive rotation
      if (touchPointsRef.current.length > 0) {
        const activeTouch = touchPointsRef.current.find(p => p.active) || touchPointsRef.current[0];
        if (activeTouch) {
          const normalizedX = (activeTouch.x / window.innerWidth - 0.5) * 2;
          const normalizedY = (activeTouch.y / window.innerHeight - 0.5) * 2;
          fernGroup.rotation.y += normalizedX * 0.02;
          fernGroup.rotation.x += normalizedY * 0.01;
        }
      } else {
        // Gentle auto-rotation when not touching
        fernGroup.rotation.y += 0.001;
      }

      // Gentle breathing sway
      const sway = Math.sin(elapsed * 0.2) * 0.05 * breath;
      fernGroup.rotation.z = sway;

      // Spring-damper scale physics
      const targetScale = 0.9 + breath * 0.2;
      const springStiffness = 0.015;
      const damping = 0.85;
      const force = (targetScale - localScale) * springStiffness;
      localScaleVelocity = localScaleVelocity * damping + force;
      localScale += localScaleVelocity;
      fernGroup.scale.setScalar(localScale);

      // Z-position breathing
      const zOffset = (localScale - 0.9) * 2.0;
      fernGroup.position.z = zOffset;

      // Opacity synced to scale
      fernMat.opacity = 0.4 + localScale * 0.5;

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
      fernGeom.dispose();
      fernMat.dispose();
      renderer.dispose();
    };
  }, [currentMode, hue, getBreathPhase]);

  // ========== DANDELION MODE (3D with breath-synced seed release) ==========
  React.useEffect(() => {
    if (currentMode !== 'dandelion' || !containerRef.current || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'none';
    rendererRef.current = renderer;
    clockRef.current = new THREE.Clock();

    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };

    const dandelionGroup = new THREE.Group();
    scene.add(dandelionGroup);

    // Stem
    const stemGeom = new THREE.CylinderGeometry(0.02, 0.03, 3, 8);
    const stemMat = new THREE.MeshBasicMaterial({
      color: hslToHex(hue, 30, 35),
      transparent: true,
      opacity: 0.6
    });
    const stem = new THREE.Mesh(stemGeom, stemMat);
    stem.position.y = -1.5;
    dandelionGroup.add(stem);

    // Seed head core
    const coreGeom = new THREE.SphereGeometry(0.15, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: hslToHex(hue, 25, 45),
      transparent: true,
      opacity: 0.7
    });
    const core = new THREE.Mesh(coreGeom, coreMat);
    dandelionGroup.add(core);

    // Seeds (attached)
    const seedCount = 50;
    const seeds = [];
    const floatingSeeds = [];

    for (let i = 0; i < seedCount; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / seedCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      const seedGroup = new THREE.Group();

      // Pappus (fluffy filaments)
      const filamentCount = 8;
      for (let j = 0; j < filamentCount; j++) {
        const fTheta = (j / filamentCount) * Math.PI * 2;
        const lineGeom = new THREE.BufferGeometry();
        const points = [
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(Math.cos(fTheta) * 0.15, 0.08, Math.sin(fTheta) * 0.15)
        ];
        lineGeom.setFromPoints(points);
        const lineMat = new THREE.LineBasicMaterial({
          color: hslToHex(hue, 40, 70),
          transparent: true,
          opacity: 0.5
        });
        const line = new THREE.Line(lineGeom, lineMat);
        seedGroup.add(line);
      }

      // Position on sphere
      seedGroup.position.set(
        Math.sin(phi) * Math.cos(theta) * 0.5,
        Math.cos(phi) * 0.5,
        Math.sin(phi) * Math.sin(theta) * 0.5
      );
      seedGroup.lookAt(0, 0, 0);
      seedGroup.rotateX(Math.PI);

      seedGroup.userData = {
        attached: true,
        phi, theta,
        velocity: new THREE.Vector3(),
        phase: Math.random() * Math.PI * 2
      };

      dandelionGroup.add(seedGroup);
      seeds.push(seedGroup);
    }

    let lastExhale = 0;

    // Spring physics state
    let localScale = 1;
    let localScaleVelocity = 0;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = clockRef.current.getElapsedTime();
      const breath = getBreathPhase(elapsed);
      const isExhaling = breath < 0.4 && elapsed > 2;

      // Touch-responsive rotation
      if (touchPointsRef.current.length > 0) {
        const activeTouch = touchPointsRef.current.find(p => p.active) || touchPointsRef.current[0];
        if (activeTouch) {
          const normalizedX = (activeTouch.x / window.innerWidth - 0.5) * 2;
          const normalizedY = (activeTouch.y / window.innerHeight - 0.5) * 2;
          dandelionGroup.rotation.y += normalizedX * 0.02;
          dandelionGroup.rotation.x += normalizedY * 0.01;

          // Release seeds when touched
          seeds.forEach(seed => {
            if (seed.userData.attached) {
              const screenPos = seed.position.clone().applyMatrix4(dandelionGroup.matrixWorld);
              screenPos.project(camera);
              const screenX = (screenPos.x + 1) / 2 * window.innerWidth;
              const screenY = (-screenPos.y + 1) / 2 * window.innerHeight;

              const dx = activeTouch.x - screenX;
              const dy = activeTouch.y - screenY;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < 100) { // Larger touch radius
                seed.userData.attached = false;
                seed.userData.velocity.set(
                  (Math.random() - 0.5) * 0.03,
                  0.015 + Math.random() * 0.015,
                  (Math.random() - 0.5) * 0.03
                );
                floatingSeeds.push(seed);
              }
            }
          });
        }
      } else {
        // Gentle auto-rotation when not touching
        dandelionGroup.rotation.y += 0.001;
      }

      // Release seeds on exhale
      if (isExhaling && elapsed - lastExhale > 3) {
        const attached = seeds.filter(s => s.userData.attached);
        const toRelease = attached.slice(0, 2);
        toRelease.forEach(seed => {
          seed.userData.attached = false;
          seed.userData.velocity.set(
            (Math.random() - 0.5) * 0.015,
            0.008 + Math.random() * 0.008,
            (Math.random() - 0.5) * 0.015
          );
          floatingSeeds.push(seed);
        });
        lastExhale = elapsed;
      }

      // Spring-damper scale physics
      const targetScale = 0.9 + breath * 0.2;
      const springStiffness = 0.015;
      const damping = 0.85;
      const force = (targetScale - localScale) * springStiffness;
      localScaleVelocity = localScaleVelocity * damping + force;
      localScale += localScaleVelocity;
      dandelionGroup.scale.setScalar(localScale);

      // Z-position breathing
      const zOffset = (localScale - 0.9) * 2.0;
      dandelionGroup.position.z = zOffset;

      // Animate attached seeds - gentle sway
      seeds.forEach(seed => {
        if (seed.userData.attached) {
          const sway = Math.sin(elapsed * 0.3 + seed.userData.phase) * 0.02;
          seed.rotation.z = sway;
          seed.children.forEach(child => {
            if (child.material) {
              child.material.opacity = 0.4 + breath * 0.3;
            }
          });
        }
      });

      // Animate floating seeds - drift upward slowly
      floatingSeeds.forEach(seed => {
        seed.position.add(seed.userData.velocity);
        seed.userData.velocity.y += 0.0001; // Gentle lift
        seed.userData.velocity.x += Math.sin(elapsed + seed.userData.phase) * 0.0002;
        seed.rotation.y += 0.01;

        // Fade out as they rise
        const fadeStart = 2;
        const opacity = Math.max(0, 0.5 - (seed.position.y - fadeStart) * 0.1);
        seed.children.forEach(child => {
          if (child.material) child.material.opacity = opacity;
        });
      });

      // Reset when all seeds gone
      if (seeds.every(s => !s.userData.attached) && floatingSeeds.every(s => s.position.y > 5)) {
        seeds.forEach((seed, i) => {
          seed.userData.attached = true;
          const phi = seed.userData.phi;
          const theta = seed.userData.theta;
          seed.position.set(
            Math.sin(phi) * Math.cos(theta) * 0.5,
            Math.cos(phi) * 0.5,
            Math.sin(phi) * Math.sin(theta) * 0.5
          );
          seed.lookAt(0, 0, 0);
          seed.rotateX(Math.PI);
        });
        floatingSeeds.length = 0;
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
      stemGeom.dispose(); stemMat.dispose();
      coreGeom.dispose(); coreMat.dispose();
      seeds.forEach(s => s.children.forEach(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); }));
      renderer.dispose();
    };
  }, [currentMode, hue, getBreathPhase]);

  // ========== SUCCULENT SPIRAL (3D Fibonacci) ==========
  React.useEffect(() => {
    if (currentMode !== 'succulent' || !containerRef.current || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 3, 4);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'none';
    rendererRef.current = renderer;
    clockRef.current = new THREE.Clock();

    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };

    const succulentGroup = new THREE.Group();
    scene.add(succulentGroup);

    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const leafCount = 60;
    const leaves = [];

    for (let i = 0; i < leafCount; i++) {
      const angle = i * goldenAngle;
      const radius = Math.sqrt(i) * 0.12;
      const height = i * 0.015;

      // Leaf shape - elongated sphere
      const t = i / leafCount;
      const leafSize = 0.08 + (1 - t) * 0.06;
      const leafGeom = new THREE.SphereGeometry(leafSize, 8, 6);
      leafGeom.scale(0.6, 1, 0.4);

      const leafMat = new THREE.MeshBasicMaterial({
        color: hslToHex(hue, 45 + (1 - t) * 15, 35 + (1 - t) * 25),
        transparent: true,
        opacity: 0.6,
        wireframe: true
      });

      const leaf = new THREE.Mesh(leafGeom, leafMat);
      leaf.position.set(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      );
      leaf.rotation.y = -angle;
      leaf.rotation.x = 0.3 + t * 0.4;

      leaf.userData = { angle, baseRadius: radius, baseHeight: height, phase: i * 0.1 };
      succulentGroup.add(leaf);
      leaves.push(leaf);
    }

    // Center core
    const coreGeom = new THREE.SphereGeometry(0.08, 12, 12);
    const coreMat = new THREE.MeshBasicMaterial({
      color: hslToHex(hue, 50, 60),
      transparent: true,
      opacity: 0.7
    });
    const core = new THREE.Mesh(coreGeom, coreMat);
    core.position.y = leafCount * 0.015 + 0.05;
    succulentGroup.add(core);

    // Spring physics state
    let localScale = 1;
    let localScaleVelocity = 0;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = clockRef.current.getElapsedTime();
      const breath = getBreathPhase(elapsed);

      // Touch-responsive rotation
      if (touchPointsRef.current.length > 0) {
        const activeTouch = touchPointsRef.current.find(p => p.active) || touchPointsRef.current[0];
        if (activeTouch) {
          const normalizedX = (activeTouch.x / window.innerWidth - 0.5) * 2;
          const normalizedY = (activeTouch.y / window.innerHeight - 0.5) * 2;
          succulentGroup.rotation.y += normalizedX * 0.02;
          succulentGroup.rotation.x += normalizedY * 0.01;
        }
      } else {
        // Gentle auto-rotation when not touching
        succulentGroup.rotation.y += 0.002;
      }

      // Spring-damper scale physics
      const targetScale = 0.9 + breath * 0.2;
      const springStiffness = 0.015;
      const damping = 0.85;
      const force = (targetScale - localScale) * springStiffness;
      localScaleVelocity = localScaleVelocity * damping + force;
      localScale += localScaleVelocity;

      // Z-position breathing
      const zOffset = (localScale - 0.9) * 2.0;
      succulentGroup.position.z = zOffset;

      // Breathing - leaves expand outward
      leaves.forEach((leaf) => {
        const expandedRadius = leaf.userData.baseRadius * (1 + (localScale - 0.9) * 0.75);
        const angle = leaf.userData.angle;

        leaf.position.x = Math.cos(angle) * expandedRadius;
        leaf.position.z = Math.sin(angle) * expandedRadius;

        // Gentle pulse
        const pulse = 1 + Math.sin(elapsed * 0.5 + leaf.userData.phase) * 0.03;
        leaf.scale.setScalar(pulse * localScale);

        leaf.material.opacity = 0.3 + localScale * 0.5;
      });

      core.scale.setScalar(localScale);
      coreMat.opacity = 0.4 + localScale * 0.4;

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
      leaves.forEach(l => { l.geometry.dispose(); l.material.dispose(); });
      coreGeom.dispose(); coreMat.dispose();
      renderer.dispose();
    };
  }, [currentMode, hue, getBreathPhase]);

  // ========== BREATH TREE (LUNGS) MODE (3D) ==========
  React.useEffect(() => {
    if (currentMode !== 'lungs' || !containerRef.current || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 6);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'none';
    rendererRef.current = renderer;
    clockRef.current = new THREE.Clock();

    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };

    const lungsGroup = new THREE.Group();
    scene.add(lungsGroup);

    const branches = [];
    const alveoli = [];

    // Recursive bronchial tree generation
    const createBranch = (startPos, direction, length, depth, maxDepth, side) => {
      if (depth > maxDepth) return;

      const endPos = startPos.clone().add(direction.clone().multiplyScalar(length));

      // Branch tube
      const branchGeom = new THREE.CylinderGeometry(
        0.015 * (maxDepth - depth + 1),
        0.02 * (maxDepth - depth + 1),
        length,
        6
      );
      const branchMat = new THREE.MeshBasicMaterial({
        color: hslToHex(hue, 45, 45),
        transparent: true,
        opacity: 0.5,
        wireframe: true
      });
      const branch = new THREE.Mesh(branchGeom, branchMat);

      const midPoint = startPos.clone().add(endPos).multiplyScalar(0.5);
      branch.position.copy(midPoint);
      branch.lookAt(endPos);
      branch.rotateX(Math.PI / 2);
      branch.userData = { depth, side };
      lungsGroup.add(branch);
      branches.push(branch);

      // Alveoli at tips
      if (depth === maxDepth) {
        const alveolusGeom = new THREE.SphereGeometry(0.04, 8, 8);
        const alveolusMat = new THREE.MeshBasicMaterial({
          color: hslToHex(hue, 55, 60),
          transparent: true,
          opacity: 0.4
        });
        const alveolus = new THREE.Mesh(alveolusGeom, alveolusMat);
        alveolus.position.copy(endPos);
        alveolus.userData = { phase: Math.random() * Math.PI * 2 };
        lungsGroup.add(alveolus);
        alveoli.push(alveolus);
      }

      // Create child branches
      const spread = 0.5 - depth * 0.05;
      const newLength = length * 0.7;

      // Left branch
      const leftDir = direction.clone();
      leftDir.applyAxisAngle(new THREE.Vector3(0, 0, 1), spread * (side === 'left' ? 1 : -1));
      leftDir.applyAxisAngle(new THREE.Vector3(1, 0, 0), (Math.random() - 0.5) * 0.3);
      createBranch(endPos.clone(), leftDir, newLength, depth + 1, maxDepth, side);

      // Right branch
      const rightDir = direction.clone();
      rightDir.applyAxisAngle(new THREE.Vector3(0, 0, 1), -spread * (side === 'left' ? 1 : -1));
      rightDir.applyAxisAngle(new THREE.Vector3(1, 0, 0), (Math.random() - 0.5) * 0.3);
      createBranch(endPos.clone(), rightDir, newLength, depth + 1, maxDepth, side);
    };

    // Trachea
    const tracheaGeom = new THREE.CylinderGeometry(0.06, 0.05, 0.8, 8);
    const tracheaMat = new THREE.MeshBasicMaterial({
      color: hslToHex(hue, 35, 40),
      transparent: true,
      opacity: 0.5,
      wireframe: true
    });
    const trachea = new THREE.Mesh(tracheaGeom, tracheaMat);
    trachea.position.y = 2;
    lungsGroup.add(trachea);

    // Left and right lungs
    const startY = 1.6;
    createBranch(new THREE.Vector3(-0.3, startY, 0), new THREE.Vector3(-0.3, -1, 0).normalize(), 0.5, 0, 5, 'left');
    createBranch(new THREE.Vector3(0.3, startY, 0), new THREE.Vector3(0.3, -1, 0).normalize(), 0.5, 0, 5, 'right');

    // Spring physics state
    let localScale = 1;
    let localScaleVelocity = 0;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = clockRef.current.getElapsedTime();
      const breath = getBreathPhase(elapsed);

      // Touch-responsive rotation
      if (touchPointsRef.current.length > 0) {
        const activeTouch = touchPointsRef.current.find(p => p.active) || touchPointsRef.current[0];
        if (activeTouch) {
          const normalizedX = (activeTouch.x / window.innerWidth - 0.5) * 2;
          const normalizedY = (activeTouch.y / window.innerHeight - 0.5) * 2;
          lungsGroup.rotation.y += normalizedX * 0.02;
          lungsGroup.rotation.x += normalizedY * 0.01;
        }
      } else {
        lungsGroup.rotation.y += 0.001;
      }

      // Spring-damper scale physics
      const targetScale = 0.9 + breath * 0.25;
      const springStiffness = 0.015;
      const damping = 0.85;
      const force = (targetScale - localScale) * springStiffness;
      localScaleVelocity = localScaleVelocity * damping + force;
      localScale += localScaleVelocity;

      // Breathing animation - lungs expand (special x/z ratio for lungs)
      lungsGroup.scale.x = localScale;
      lungsGroup.scale.z = localScale * 0.8;

      // Z-position breathing
      const zOffset = (localScale - 0.9) * 2.0;
      lungsGroup.position.z = zOffset;

      // Branches pulse with breath
      branches.forEach(branch => {
        branch.material.opacity = 0.3 + localScale * 0.5;
      });

      // Alveoli glow brighter during inhale
      alveoli.forEach(alveolus => {
        const pulse = 0.8 + Math.sin(elapsed * 0.8 + alveolus.userData.phase) * 0.2;
        alveolus.scale.setScalar(pulse + (localScale - 0.9) * 1.5);
        alveolus.material.opacity = 0.3 + localScale * 0.5;
      });

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
      branches.forEach(b => { b.geometry.dispose(); b.material.dispose(); });
      alveoli.forEach(a => { a.geometry.dispose(); a.material.dispose(); });
      tracheaGeom.dispose(); tracheaMat.dispose();
      renderer.dispose();
    };
  }, [currentMode, hue, getBreathPhase]);

  // ========== JELLYFISH MODE (THREE.JS 3D) ==========
  React.useEffect(() => {
    if (currentMode !== 'jellyfish' || !containerRef.current) return;

    // === COLOR SCHEME (dynamic based on hue) ===
    // Convert HSL to hex for THREE.js
    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };

    const COLORS = {
      bell: new THREE.Color(hslToHex(hue, 52, 68)),        // Main color
      tentacle: new THREE.Color(hslToHex(hue, 50, 45)),    // Slightly darker
      accent: new THREE.Color(hslToHex(hue, 60, 80)),      // Brighter accent
      dim: new THREE.Color(hslToHex(hue, 40, 20)),         // Dark version
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

    // Spring physics for fluid breathing
    let springScaleY = 1;
    let springScaleXZ = 1;
    let springVelocityY = 0;
    let springVelocityXZ = 0;
    let springZ = 0;
    let springVelocityZ = 0;

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
      controls.dampingFactor = 0.12;
      controls.rotateSpeed = 0.4; // Slower touch sensitivity
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
      // Bell animation based on breath - calculate target values
      let targetScaleY = 1.0;
      let targetScaleXZ = 1.0;
      let targetZ = 0;
      let colorLerp = 0;

      if (breathPhase === 'inhale') {
        targetScaleY = 1.0 + breathProgress * 0.15;
        targetScaleXZ = 1.0 - breathProgress * 0.08;
        targetZ = breathProgress * 0.15;
        colorLerp = breathProgress;
      } else if (breathPhase === 'hold') {
        const pulse = Math.sin(elapsed * 3) * 0.02;
        targetScaleY = 1.15 + pulse;
        targetScaleXZ = 0.92 - pulse * 0.5;
        targetZ = 0.15;
        colorLerp = 1;
      } else { // exhale
        targetScaleY = 1.15 - breathProgress * 0.15;
        targetScaleXZ = 0.92 + breathProgress * 0.08;
        targetZ = 0.15 - breathProgress * 0.15;
        colorLerp = 1 - breathProgress;
      }

      // Spring-damper physics for fluid bell animation
      const springStiffness = 0.02;
      const damping = 0.85;

      const forceY = (targetScaleY - springScaleY) * springStiffness;
      springVelocityY = springVelocityY * damping + forceY;
      springScaleY += springVelocityY;

      const forceXZ = (targetScaleXZ - springScaleXZ) * springStiffness;
      springVelocityXZ = springVelocityXZ * damping + forceXZ;
      springScaleXZ += springVelocityXZ;

      const forceZ = (targetZ - springZ) * springStiffness;
      springVelocityZ = springVelocityZ * damping + forceZ;
      springZ += springVelocityZ;

      // Apply spring-based bell transformations
      bell.scale.set(springScaleXZ, springScaleY, springScaleXZ);
      innerBell.scale.set(springScaleXZ * 0.85, springScaleY * 0.85, springScaleXZ * 0.85);
      jellyfishGroup.position.y = (springScaleY - 1.0) * 0.7;
      jellyfishGroup.position.z = springZ;

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
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [currentMode, hue, getBreathPhase]);

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
        this.pulseSpeed = 0.003 + Math.random() * 0.002; // Very slow pulse
        this.driftVelocity = { x: (Math.random() - 0.5) * 0.02, y: -0.005 - Math.random() * 0.005 }; // Very gentle drift
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

        // Very gentle upward thrust on pulse peak
        if (pulse > 0.9 && this.lastPulse <= 0.9) {
          this.driftVelocity.y -= 0.02 + Math.random() * 0.01;
          this.driftVelocity.x += (Math.random() - 0.5) * 0.015;
        }
        this.lastPulse = pulse;

        // Apply physics
        this.position.x += this.driftVelocity.x;
        this.position.y += this.driftVelocity.y;

        // High friction and very gentle buoyancy (rise)
        this.driftVelocity.x *= 0.995;
        this.driftVelocity.y *= 0.995;
        this.driftVelocity.y -= 0.0005; // Very gentle rise (buoyancy)

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
        this.driftVelocity.x += fx * 0.04;
        this.driftVelocity.y += fy * 0.04;
        this.tentacles.forEach(t => t.applyForce(fx, fy, 0.4));
        this.oralArms.forEach(o => o.applyForce(fx, fy, 0.3));
      }
    }

    // Plankton particle class
    class Plankton {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.3;
        this.speed = (Math.random() * 0.15 + 0.05) * MOBILE_SPEED;
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
        } else if (dist < jelly.size * 3) {
          // Near - gently drift away
          const angle = Math.atan2(jelly.position.y - y, jelly.position.x - x);
          jelly.applyForce(Math.cos(angle) * 0.03, Math.sin(angle) * 0.03);
          jelly.pulseSpeed = 0.006;
        }
      });

      // Create current
      currents.push({ x, y, radius: 0, strength: 1, direction: { x: 0, y: 0 } });
    };

    const handleJellyMove = (x, y) => {
      // Following jellyfish move toward finger - very gently
      jellies.filter(j => j.following).forEach(jelly => {
        const dx = x - jelly.position.x;
        const dy = y - jelly.position.y;
        jelly.driftVelocity.x += dx * 0.0008;
        jelly.driftVelocity.y += dy * 0.0008;
      });

      // Update current direction - much gentler
      if (currents.length > 0 && lastTouchPos) {
        const current = currents[currents.length - 1];
        current.direction.x = (x - lastTouchPos.x) * 0.1;
        current.direction.y = (y - lastTouchPos.y) * 0.1;
      }
      lastTouchPos = { x, y };
    };

    const handleJellyEnd = () => {
      jellies.forEach(jelly => {
        jelly.following = false;
        jelly.pulseSpeed = 0.003 + Math.random() * 0.002;
      });
      lastTouchPos = null;
    };

    // Apply currents to jellies
    const applyCurrent = () => {
      currents.forEach((current, idx) => {
        current.radius += 2;
        current.strength *= 0.95;

        jellies.forEach(jelly => {
          const dist = Math.hypot(current.x - jelly.position.x, current.y - jelly.position.y);
          if (dist < current.radius && dist > current.radius - 60) {
            const influence = current.strength * (1 - dist / Math.max(current.radius, 1)) * 0.15;
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
      bgGradient.addColorStop(0, '#000');
      bgGradient.addColorStop(0.5, '#000');
      bgGradient.addColorStop(1, '#000');
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

  // ========== MUSHROOMS MODE (3D with Torus-style touch mechanics) ==========
  React.useEffect(() => {
    if (currentMode !== 'mushrooms' || !containerRef.current || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1, 6);
    camera.lookAt(0, 0.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'none';
    rendererRef.current = renderer;
    clockRef.current = new THREE.Clock();

    // HSL to hex for THREE.js
    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };

    // Create mushroom group
    const mushroomGroup = new THREE.Group();
    scene.add(mushroomGroup);

    // Create central large mushroom
    const createMushroom = (x, z, scale) => {
      const mushroom = new THREE.Group();

      // Stem - tapered cylinder using lathe geometry
      const stemPoints = [];
      for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        const radius = 0.12 + Math.sin(t * Math.PI) * 0.03;
        stemPoints.push(new THREE.Vector2(radius * scale, t * 1.2 * scale));
      }
      const stemGeom = new THREE.LatheGeometry(stemPoints, 16);
      const stemMat = new THREE.MeshBasicMaterial({
        color: hslToHex(hue, 20, 40),
        transparent: true,
        opacity: 0.6,
        wireframe: true
      });
      const stem = new THREE.Mesh(stemGeom, stemMat);
      mushroom.add(stem);

      // Cap - half sphere with spots
      const capGeom = new THREE.SphereGeometry(0.5 * scale, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.6);
      const capMat = new THREE.MeshBasicMaterial({
        color: hslToHex(hue, 60, 50),
        transparent: true,
        opacity: 0.7,
        wireframe: true
      });
      const cap = new THREE.Mesh(capGeom, capMat);
      cap.position.y = 1.2 * scale;
      cap.rotation.x = Math.PI;
      mushroom.add(cap);

      // Bioluminescent spots on cap
      const spotCount = 8;
      for (let i = 0; i < spotCount; i++) {
        const theta = (i / spotCount) * Math.PI * 2;
        const phi = 0.3 + Math.random() * 0.4;
        const spotGeom = new THREE.SphereGeometry(0.05 * scale, 8, 8);
        const spotMat = new THREE.MeshBasicMaterial({
          color: hslToHex(hue, 80, 70),
          transparent: true,
          opacity: 0.8
        });
        const spot = new THREE.Mesh(spotGeom, spotMat);
        spot.position.set(
          Math.sin(phi) * Math.cos(theta) * 0.4 * scale,
          1.2 * scale - Math.cos(phi) * 0.35 * scale,
          Math.sin(phi) * Math.sin(theta) * 0.4 * scale
        );
        spot.userData = { phase: Math.random() * Math.PI * 2 };
        mushroom.add(spot);
      }

      // Gills under cap
      const gillsGeom = new THREE.ConeGeometry(0.45 * scale, 0.2 * scale, 24, 1, true);
      const gillsMat = new THREE.MeshBasicMaterial({
        color: hslToHex(hue, 40, 35),
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
        wireframe: true
      });
      const gills = new THREE.Mesh(gillsGeom, gillsMat);
      gills.position.y = 1.1 * scale;
      gills.rotation.x = Math.PI;
      mushroom.add(gills);

      mushroom.position.set(x, 0, z);
      mushroom.userData = {
        baseY: 0,
        phase: Math.random() * Math.PI * 2,
        rotationSpeed: 0.001 + Math.random() * 0.002
      };

      return mushroom;
    };

    // Create multiple mushrooms in a cluster
    const mushrooms = [];
    mushrooms.push(createMushroom(0, 0, 1.2)); // Central large one
    mushrooms.push(createMushroom(-1.5, 0.5, 0.7));
    mushrooms.push(createMushroom(1.3, 0.3, 0.8));
    mushrooms.push(createMushroom(-0.8, -1.2, 0.6));
    mushrooms.push(createMushroom(1.0, -0.8, 0.65));
    mushrooms.push(createMushroom(0.3, 1.5, 0.5));

    mushrooms.forEach(m => mushroomGroup.add(m));

    // Spores particle system
    const sporeCount = 200;
    const sporeGeom = new THREE.BufferGeometry();
    const sporePositions = new Float32Array(sporeCount * 3);
    const sporeSizes = new Float32Array(sporeCount);
    const sporePhases = new Float32Array(sporeCount);

    for (let i = 0; i < sporeCount; i++) {
      sporePositions[i * 3] = (Math.random() - 0.5) * 6;
      sporePositions[i * 3 + 1] = Math.random() * 4;
      sporePositions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      sporeSizes[i] = 0.02 + Math.random() * 0.03;
      sporePhases[i] = Math.random() * Math.PI * 2;
    }
    sporeGeom.setAttribute('position', new THREE.BufferAttribute(sporePositions, 3));

    const sporeMat = new THREE.PointsMaterial({
      color: hslToHex(hue, 60, 60),
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const spores = new THREE.Points(sporeGeom, sporeMat);
    scene.add(spores);

    // Spring physics state
    let localScale = 1;
    let localScaleVelocity = 0;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = clockRef.current.getElapsedTime();
      const breath = getBreathPhase(elapsed);

      // Touch-responsive rotation
      if (touchPointsRef.current.length > 0) {
        const activeTouch = touchPointsRef.current.find(p => p.active) || touchPointsRef.current[0];
        if (activeTouch) {
          const normalizedX = (activeTouch.x / window.innerWidth - 0.5) * 2;
          const normalizedY = (activeTouch.y / window.innerHeight - 0.5) * 2;
          mushroomGroup.rotation.y += normalizedX * 0.02;
          mushroomGroup.rotation.x += normalizedY * 0.01;
        }
      } else {
        // Gentle auto-rotation when not touching
        mushroomGroup.rotation.y += 0.001;
      }

      // Spring-damper scale physics
      const targetScale = 0.9 + breath * 0.2;
      const springStiffness = 0.015;
      const damping = 0.85;
      const force = (targetScale - localScale) * springStiffness;
      localScaleVelocity = localScaleVelocity * damping + force;
      localScale += localScaleVelocity;

      // Z-position breathing
      const zOffset = (localScale - 0.9) * 2.0;
      mushroomGroup.position.z = zOffset;

      // Animate individual mushrooms
      mushrooms.forEach((mushroom) => {
        // Scale synced to spring physics
        mushroom.scale.setScalar(localScale);

        // Gentle bob
        mushroom.position.y = mushroom.userData.baseY + Math.sin(elapsed * 0.5 + mushroom.userData.phase) * 0.05;

        // Rotate cap slightly
        const cap = mushroom.children[1];
        if (cap) {
          cap.rotation.y = elapsed * mushroom.userData.rotationSpeed * 10;
        }

        // Pulse spots
        mushroom.children.forEach(child => {
          if (child.userData && child.userData.phase !== undefined) {
            const pulse = 0.5 + Math.sin(elapsed * 2 + child.userData.phase) * 0.5;
            child.material.opacity = 0.4 + pulse * 0.6 + breath * 0.2;
          }
        });
      });

      // Animate spores floating upward
      const positions = sporeGeom.attributes.position.array;
      for (let i = 0; i < sporeCount; i++) {
        const idx = i * 3;
        positions[idx + 1] += 0.005 + Math.sin(elapsed + sporePhases[i]) * 0.002;
        positions[idx] += Math.sin(elapsed * 0.5 + sporePhases[i]) * 0.002;
        positions[idx + 2] += Math.cos(elapsed * 0.5 + sporePhases[i]) * 0.002;

        // Touch influence on spores
        touchPointsRef.current.forEach(point => {
          if (point.active) {
            const screenX = (point.x / window.innerWidth - 0.5) * 8;
            const screenY = -(point.y / window.innerHeight - 0.5) * 6;
            const dx = positions[idx] - screenX;
            const dz = positions[idx + 2];
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist < 2) {
              positions[idx] += dx * 0.02;
              positions[idx + 1] += 0.02;
              positions[idx + 2] += dz * 0.02;
            }
          }
        });

        // Reset spores that float too high
        if (positions[idx + 1] > 5) {
          positions[idx + 1] = -0.5;
          positions[idx] = (Math.random() - 0.5) * 6;
          positions[idx + 2] = (Math.random() - 0.5) * 6;
        }
      }
      sporeGeom.attributes.position.needsUpdate = true;
      sporeMat.opacity = 0.3 + breath * 0.4;

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
      // Dispose geometries and materials
      mushrooms.forEach(m => {
        m.children.forEach(child => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        });
      });
      sporeGeom.dispose();
      sporeMat.dispose();
      renderer.dispose();
    };
  }, [currentMode, hue]);

  // ========== FLOWER OF LIFE MODE (3D) ==========
  React.useEffect(() => {
    if (currentMode !== 'flowerOfLife' || !containerRef.current || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'none';
    rendererRef.current = renderer;
    clockRef.current = new THREE.Clock();

    // Convert HSL hue to hex color
    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };

    const dynamicColor = hslToHex(hue, 52, 68);
    const material = new THREE.MeshBasicMaterial({ color: dynamicColor, wireframe: true, transparent: true, opacity: 0.8 });

    // Create flower of life pattern with ring geometries
    const group = new THREE.Group();
    const ringRadius = 0.6;
    const tubeRadius = 0.015;
    const segments = 64;
    const geometries = [];

    // Circle positions for flower of life pattern
    const circlePositions = [
      { x: 0, y: 0 }, // Center
    ];

    // First ring (6 circles)
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      circlePositions.push({
        x: Math.cos(angle) * ringRadius,
        y: Math.sin(angle) * ringRadius
      });
    }

    // Second ring (12 circles)
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      circlePositions.push({
        x: Math.cos(angle) * ringRadius * 2,
        y: Math.sin(angle) * ringRadius * 2
      });
      const betweenAngle = angle + Math.PI / 6;
      circlePositions.push({
        x: Math.cos(betweenAngle) * ringRadius * Math.sqrt(3),
        y: Math.sin(betweenAngle) * ringRadius * Math.sqrt(3)
      });
    }

    // Create a ring for each circle position
    circlePositions.forEach(pos => {
      const geometry = new THREE.TorusGeometry(ringRadius, tubeRadius, 16, segments);
      geometries.push(geometry);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(pos.x, pos.y, 0);
      group.add(mesh);
    });

    scene.add(group);
    meshRef.current = group;

    // Spring physics state
    let localScale = 1;
    let localScaleVelocity = 0;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = clockRef.current.getElapsedTime();
      const breath = getBreathPhase(elapsed);

      if (meshRef.current) {
        // Touch-responsive rotation
        if (touchPointsRef.current.length > 0) {
          const activeTouch = touchPointsRef.current.find(p => p.active) || touchPointsRef.current[0];
          if (activeTouch) {
            const normalizedX = (activeTouch.x / window.innerWidth - 0.5) * 2;
            const normalizedY = (activeTouch.y / window.innerHeight - 0.5) * 2;
            meshRef.current.rotation.y += normalizedX * 0.02;
            meshRef.current.rotation.x += normalizedY * 0.02;
          }
        } else {
          // Gentle auto-rotation when not touching
          meshRef.current.rotation.y += 0.001;
          meshRef.current.rotation.x += 0.0005;
          meshRef.current.rotation.z += 0.0003;
        }

        // Spring-damper scale physics
        const targetScale = 0.85 + breath * 0.35;
        const springStiffness = 0.015;
        const damping = 0.85;
        const force = (targetScale - localScale) * springStiffness;
        localScaleVelocity = localScaleVelocity * damping + force;
        localScale += localScaleVelocity;
        meshRef.current.scale.setScalar(localScale);

        // Z-position breathing
        const zOffset = (localScale - 0.85) * 2.3 - 0.3;
        meshRef.current.position.z = zOffset;

        // Opacity synced to scale
        material.opacity = 0.4 + localScale * 0.4;
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
      geometries.forEach(g => g.dispose());
      material.dispose();
      renderer.dispose();
    };
  }, [currentMode, hue, getBreathPhase]);

  // ========== KOI POND MODE (3D) ==========
  React.useEffect(() => {
    if (currentMode !== 'koiPond' || !containerRef.current || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 4);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'none';
    rendererRef.current = renderer;
    clockRef.current = new THREE.Clock();

    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };

    const pondGroup = new THREE.Group();
    scene.add(pondGroup);

    // Create stylized koi fish
    const fishArray = [];
    const numFish = 7;

    const createKoi = (index) => {
      const fishGroup = new THREE.Group();

      // Body - elongated ellipsoid
      const bodyGeom = new THREE.SphereGeometry(0.3, 16, 12);
      bodyGeom.scale(1.8, 0.5, 0.8);

      // Fish colors - variations of the primary hue
      const colorVariant = index % 4;
      let bodyColor;
      if (colorVariant === 0) {
        bodyColor = hslToHex(hue, 70, 55); // Primary bright
      } else if (colorVariant === 1) {
        bodyColor = hslToHex(hue, 50, 45); // Primary muted
      } else if (colorVariant === 2) {
        bodyColor = hslToHex(hue, 60, 65); // Primary light
      } else {
        bodyColor = hslToHex(hue, 40, 35); // Primary dark
      }

      const bodyMat = new THREE.MeshBasicMaterial({
        color: bodyColor,
        transparent: true,
        opacity: 0.75
      });
      const body = new THREE.Mesh(bodyGeom, bodyMat);
      fishGroup.add(body);

      // Tail fin - flowing shape
      const tailGeom = new THREE.ConeGeometry(0.2, 0.5, 8);
      tailGeom.rotateX(Math.PI / 2);
      const tailMat = new THREE.MeshBasicMaterial({
        color: bodyColor,
        transparent: true,
        opacity: 0.6
      });
      const tail = new THREE.Mesh(tailGeom, tailMat);
      tail.position.set(-0.55, 0, 0);
      fishGroup.add(tail);

      // Dorsal fin
      const dorsalGeom = new THREE.ConeGeometry(0.08, 0.25, 4);
      const dorsalMat = new THREE.MeshBasicMaterial({
        color: bodyColor,
        transparent: true,
        opacity: 0.5
      });
      const dorsal = new THREE.Mesh(dorsalGeom, dorsalMat);
      dorsal.position.set(0, 0.2, 0);
      fishGroup.add(dorsal);

      // Random starting position and movement parameters
      const angle = (index / numFish) * Math.PI * 2;
      const radius = 1.5 + Math.random() * 1.5;
      fishGroup.position.set(
        Math.cos(angle) * radius,
        -0.2 + Math.random() * 0.15,
        Math.sin(angle) * radius
      );

      fishGroup.userData = {
        baseAngle: angle,
        orbitRadius: radius,
        speed: 0.15 + Math.random() * 0.1,
        wobblePhase: Math.random() * Math.PI * 2,
        depthPhase: Math.random() * Math.PI * 2,
        tail: tail
      };

      pondGroup.add(fishGroup);
      return fishGroup;
    };

    for (let i = 0; i < numFish; i++) {
      fishArray.push(createKoi(i));
    }

    // Water surface - subtle rippling plane
    const waterGeom = new THREE.PlaneGeometry(10, 10, 32, 32);
    const waterMat = new THREE.MeshBasicMaterial({
      color: hslToHex(hue, 40, 20),
      transparent: true,
      opacity: 0.3,
      wireframe: true,
      side: THREE.DoubleSide
    });
    const water = new THREE.Mesh(waterGeom, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0.1;
    pondGroup.add(water);

    // Lily pads - circular shapes
    const lilyPads = [];
    const numLilies = 5;
    for (let i = 0; i < numLilies; i++) {
      const lilyGeom = new THREE.CircleGeometry(0.25 + Math.random() * 0.15, 12);
      const lilyMat = new THREE.MeshBasicMaterial({
        color: hslToHex(hue, 30, 25),
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
      });
      const lily = new THREE.Mesh(lilyGeom, lilyMat);
      lily.rotation.x = -Math.PI / 2;
      const lilyAngle = Math.random() * Math.PI * 2;
      const lilyRadius = 1 + Math.random() * 2.5;
      lily.position.set(
        Math.cos(lilyAngle) * lilyRadius,
        0.12,
        Math.sin(lilyAngle) * lilyRadius
      );
      lily.userData = { phase: Math.random() * Math.PI * 2 };
      pondGroup.add(lily);
      lilyPads.push(lily);
    }

    // Touch ripple rings
    const rippleRings = [];
    const createRipple = (x, z) => {
      const ringGeom = new THREE.RingGeometry(0.1, 0.15, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: hslToHex(hue, 50, 60),
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(x, 0.15, z);
      ring.userData = { age: 0, startRadius: 0.1 };
      pondGroup.add(ring);
      rippleRings.push(ring);
    };

    // Spring physics state
    let localScale = 1;
    let localScaleVelocity = 0;
    let lastTouchTime = 0;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = clockRef.current.getElapsedTime();
      const breath = getBreathPhase(elapsed);

      // Touch-responsive camera rotation
      if (touchPointsRef.current.length > 0) {
        const activeTouch = touchPointsRef.current.find(p => p.active) || touchPointsRef.current[0];
        if (activeTouch) {
          const normalizedX = (activeTouch.x / window.innerWidth - 0.5) * 2;
          const normalizedY = (activeTouch.y / window.innerHeight - 0.5) * 2;
          pondGroup.rotation.y += normalizedX * 0.015;
          camera.position.y = 5 + normalizedY * 0.5;
          camera.lookAt(0, 0, 0);

          // Create ripples on touch
          if (elapsed - lastTouchTime > 0.3) {
            const touchX = normalizedX * 3;
            const touchZ = normalizedY * 3;
            createRipple(touchX, touchZ);
            lastTouchTime = elapsed;
          }
        }
      } else {
        pondGroup.rotation.y += 0.0005;
      }

      // Spring-damper scale physics
      const targetScale = 0.95 + breath * 0.1;
      const springStiffness = 0.015;
      const damping = 0.85;
      const force = (targetScale - localScale) * springStiffness;
      localScaleVelocity = localScaleVelocity * damping + force;
      localScale += localScaleVelocity;
      pondGroup.scale.setScalar(localScale);

      // Z-position breathing
      const zOffset = (localScale - 0.95) * 1.5;
      pondGroup.position.z = zOffset;

      // Animate fish
      fishArray.forEach((fish, i) => {
        const data = fish.userData;
        const speedMod = 0.7 + breath * 0.6; // Faster on inhale

        // Figure-8 swimming pattern
        const t = elapsed * data.speed * speedMod + data.baseAngle;
        const x = Math.sin(t) * data.orbitRadius;
        const z = Math.sin(t * 2) * data.orbitRadius * 0.5;

        // Smooth position update
        fish.position.x += (x - fish.position.x) * 0.02;
        fish.position.z += (z - fish.position.z) * 0.02;

        // Depth variation with breath
        const depthWave = Math.sin(elapsed * 0.5 + data.depthPhase) * 0.1;
        fish.position.y = -0.2 + depthWave + breath * 0.05;

        // Face direction of movement
        const dx = x - fish.position.x;
        const dz = z - fish.position.z;
        if (Math.abs(dx) > 0.001 || Math.abs(dz) > 0.001) {
          const targetAngle = Math.atan2(dz, dx);
          fish.rotation.y = targetAngle;
        }

        // Tail waggle
        data.tail.rotation.y = Math.sin(elapsed * 8 * speedMod + data.wobblePhase) * 0.3;

        // Body undulation
        fish.rotation.z = Math.sin(elapsed * 4 * speedMod + data.wobblePhase) * 0.05;
      });

      // Animate water surface
      const positions = waterGeom.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i + 1];
        positions[i + 2] = Math.sin(x * 2 + elapsed) * 0.02 +
                          Math.cos(z * 2 + elapsed * 0.7) * 0.02 +
                          breath * 0.03;
      }
      waterGeom.attributes.position.needsUpdate = true;
      waterMat.opacity = 0.2 + breath * 0.15;

      // Animate lily pads
      lilyPads.forEach(lily => {
        const bob = Math.sin(elapsed * 0.8 + lily.userData.phase) * 0.02;
        lily.position.y = 0.12 + bob + breath * 0.02;
        lily.rotation.z = Math.sin(elapsed * 0.3 + lily.userData.phase) * 0.05;
      });

      // Animate and cleanup ripples
      for (let i = rippleRings.length - 1; i >= 0; i--) {
        const ring = rippleRings[i];
        ring.userData.age += 0.016;
        const age = ring.userData.age;
        const newRadius = ring.userData.startRadius + age * 1.5;
        ring.scale.setScalar(1 + age * 8);
        ring.material.opacity = Math.max(0, 0.6 - age * 0.8);

        if (age > 1) {
          pondGroup.remove(ring);
          ring.geometry.dispose();
          ring.material.dispose();
          rippleRings.splice(i, 1);
        }
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
      // Dispose geometries and materials
      fishArray.forEach(fish => {
        fish.children.forEach(child => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        });
      });
      waterGeom.dispose();
      waterMat.dispose();
      lilyPads.forEach(lily => {
        lily.geometry.dispose();
        lily.material.dispose();
      });
      rippleRings.forEach(ring => {
        ring.geometry.dispose();
        ring.material.dispose();
      });
      renderer.dispose();
    };
  }, [currentMode, hue, getBreathPhase]);

  // ========== BIOLUMINESCENT OCEAN MODE (3D) ==========
  React.useEffect(() => {
    if (currentMode !== 'bioluminescent' || !containerRef.current || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'none';
    rendererRef.current = renderer;
    clockRef.current = new THREE.Clock();

    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };

    const oceanGroup = new THREE.Group();
    scene.add(oceanGroup);

    // Bioluminescent particles - primary color
    const particleCount = 1500;
    const particleGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const baseBrightness = new Float32Array(particleCount);
    const phases = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 12;
      positions[i3 + 1] = (Math.random() - 0.5) * 8;
      positions[i3 + 2] = (Math.random() - 0.5) * 8;
      velocities[i3] = (Math.random() - 0.5) * 0.01;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.01;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.01;
      baseBrightness[i] = 0.3 + Math.random() * 0.4;
      phases[i] = Math.random() * Math.PI * 2;
    }

    particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: hslToHex(hue, 70, 55),
      size: 0.06,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeom, particleMat);
    oceanGroup.add(particles);

    // Subtle accent particles
    const whiteParticleCount = 300;
    const whiteParticleGeom = new THREE.BufferGeometry();
    const whitePositions = new Float32Array(whiteParticleCount * 3);
    const whiteVelocities = new Float32Array(whiteParticleCount * 3);
    const whitePhases = new Float32Array(whiteParticleCount);

    for (let i = 0; i < whiteParticleCount; i++) {
      const i3 = i * 3;
      whitePositions[i3] = (Math.random() - 0.5) * 12;
      whitePositions[i3 + 1] = (Math.random() - 0.5) * 8;
      whitePositions[i3 + 2] = (Math.random() - 0.5) * 8;
      whiteVelocities[i3] = (Math.random() - 0.5) * 0.008;
      whiteVelocities[i3 + 1] = (Math.random() - 0.5) * 0.008;
      whiteVelocities[i3 + 2] = (Math.random() - 0.5) * 0.008;
      whitePhases[i] = Math.random() * Math.PI * 2;
    }

    whiteParticleGeom.setAttribute('position', new THREE.BufferAttribute(whitePositions, 3));

    const whiteParticleMat = new THREE.PointsMaterial({
      color: hslToHex(hue, 30, 75), // Subtle tint of primary hue
      size: 0.03,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });

    const whiteParticles = new THREE.Points(whiteParticleGeom, whiteParticleMat);
    oceanGroup.add(whiteParticles);

    // Larger glowing orbs - jellyfish-like creatures
    const orbs = [];
    const numOrbs = 12;
    for (let i = 0; i < numOrbs; i++) {
      const orbGeom = new THREE.SphereGeometry(0.15 + Math.random() * 0.1, 16, 16);
      // Just two variations of primary hue for cohesion
      const orbColor = i % 2 === 0
        ? hslToHex(hue, 65, 55)  // Primary
        : hslToHex(hue, 50, 65); // Lighter variant
      const orbMat = new THREE.MeshBasicMaterial({
        color: orbColor,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
      });
      const orb = new THREE.Mesh(orbGeom, orbMat);

      orb.position.set(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6
      );

      orb.userData = {
        basePos: orb.position.clone(),
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.3,
        brightness: 0.5,
        targetBrightness: 0.5
      };

      oceanGroup.add(orb);
      orbs.push(orb);
    }

    // Trailing light wisps
    const wisps = [];
    const numWisps = 8;
    for (let i = 0; i < numWisps; i++) {
      const wispGeom = new THREE.BufferGeometry();
      const wispPositions = new Float32Array(30 * 3); // 30 points per wisp
      for (let j = 0; j < 30; j++) {
        const j3 = j * 3;
        wispPositions[j3] = (Math.random() - 0.5) * 8;
        wispPositions[j3 + 1] = (Math.random() - 0.5) * 6;
        wispPositions[j3 + 2] = (Math.random() - 0.5) * 6;
      }
      wispGeom.setAttribute('position', new THREE.BufferAttribute(wispPositions, 3));

      const wispMat = new THREE.LineBasicMaterial({
        color: hslToHex(hue, 40, 50),
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
      });

      const wisp = new THREE.Line(wispGeom, wispMat);
      wisp.userData = {
        phase: Math.random() * Math.PI * 2,
        speed: 0.1 + Math.random() * 0.1
      };
      oceanGroup.add(wisp);
      wisps.push(wisp);
    }

    // Touch influence tracking
    let touchInfluence = { x: 0, y: 0, strength: 0 };

    // Spring physics state
    let localScale = 1;
    let localScaleVelocity = 0;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = clockRef.current.getElapsedTime();
      const breath = getBreathPhase(elapsed);

      // Touch-responsive rotation and influence
      if (touchPointsRef.current.length > 0) {
        const activeTouch = touchPointsRef.current.find(p => p.active) || touchPointsRef.current[0];
        if (activeTouch) {
          const normalizedX = (activeTouch.x / window.innerWidth - 0.5) * 2;
          const normalizedY = (activeTouch.y / window.innerHeight - 0.5) * 2;
          oceanGroup.rotation.y += normalizedX * 0.01;
          oceanGroup.rotation.x += normalizedY * 0.005;

          // Track touch for particle interaction
          touchInfluence.x = normalizedX * 4;
          touchInfluence.y = -normalizedY * 3;
          touchInfluence.strength = Math.min(1, touchInfluence.strength + 0.05);
        }
      } else {
        oceanGroup.rotation.y += 0.0008;
        touchInfluence.strength *= 0.95;
      }

      // Spring-damper scale physics
      const targetScale = 0.9 + breath * 0.2;
      const springStiffness = 0.015;
      const damping = 0.85;
      const force = (targetScale - localScale) * springStiffness;
      localScaleVelocity = localScaleVelocity * damping + force;
      localScale += localScaleVelocity;
      oceanGroup.scale.setScalar(localScale);

      // Z-position breathing
      const zOffset = (localScale - 0.9) * 2.0;
      oceanGroup.position.z = zOffset;

      // Animate particles with touch reactivity
      const particlePositions = particleGeom.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // Drift movement
        particlePositions[i3] += velocities[i3] + Math.sin(elapsed * 0.5 + phases[i]) * 0.002;
        particlePositions[i3 + 1] += velocities[i3 + 1] + Math.cos(elapsed * 0.3 + phases[i]) * 0.002;
        particlePositions[i3 + 2] += velocities[i3 + 2];

        // Touch attraction/reaction
        if (touchInfluence.strength > 0.1) {
          const dx = touchInfluence.x - particlePositions[i3];
          const dy = touchInfluence.y - particlePositions[i3 + 1];
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 3) {
            const attraction = touchInfluence.strength * 0.01 / (dist + 0.5);
            particlePositions[i3] += dx * attraction;
            particlePositions[i3 + 1] += dy * attraction;
          }
        }

        // Wrap around boundaries
        if (particlePositions[i3] > 6) particlePositions[i3] = -6;
        if (particlePositions[i3] < -6) particlePositions[i3] = 6;
        if (particlePositions[i3 + 1] > 4) particlePositions[i3 + 1] = -4;
        if (particlePositions[i3 + 1] < -4) particlePositions[i3 + 1] = 4;
        if (particlePositions[i3 + 2] > 4) particlePositions[i3 + 2] = -4;
        if (particlePositions[i3 + 2] < -4) particlePositions[i3 + 2] = 4;
      }
      particleGeom.attributes.position.needsUpdate = true;

      // Particle brightness pulses with breath
      particleMat.opacity = 0.4 + breath * 0.4 + touchInfluence.strength * 0.2;
      particleMat.size = 0.05 + breath * 0.03;

      // Animate white particles
      const whiteParticlePositions = whiteParticleGeom.attributes.position.array;
      for (let i = 0; i < whiteParticleCount; i++) {
        const i3 = i * 3;
        whiteParticlePositions[i3] += whiteVelocities[i3] + Math.sin(elapsed * 0.4 + whitePhases[i]) * 0.001;
        whiteParticlePositions[i3 + 1] += whiteVelocities[i3 + 1] + Math.cos(elapsed * 0.25 + whitePhases[i]) * 0.001;
        whiteParticlePositions[i3 + 2] += whiteVelocities[i3 + 2];

        // Wrap around boundaries
        if (whiteParticlePositions[i3] > 6) whiteParticlePositions[i3] = -6;
        if (whiteParticlePositions[i3] < -6) whiteParticlePositions[i3] = 6;
        if (whiteParticlePositions[i3 + 1] > 4) whiteParticlePositions[i3 + 1] = -4;
        if (whiteParticlePositions[i3 + 1] < -4) whiteParticlePositions[i3 + 1] = 4;
        if (whiteParticlePositions[i3 + 2] > 4) whiteParticlePositions[i3 + 2] = -4;
        if (whiteParticlePositions[i3 + 2] < -4) whiteParticlePositions[i3 + 2] = 4;
      }
      whiteParticleGeom.attributes.position.needsUpdate = true;
      whiteParticleMat.opacity = 0.3 + breath * 0.3;

      // Animate orbs
      orbs.forEach((orb, i) => {
        const data = orb.userData;

        // Floating motion
        orb.position.x = data.basePos.x + Math.sin(elapsed * data.speed + data.phase) * 0.8;
        orb.position.y = data.basePos.y + Math.cos(elapsed * data.speed * 0.7 + data.phase) * 0.6;
        orb.position.z = data.basePos.z + Math.sin(elapsed * data.speed * 0.5) * 0.4;

        // Touch proximity glow
        if (touchInfluence.strength > 0.1) {
          const dx = touchInfluence.x - orb.position.x;
          const dy = touchInfluence.y - orb.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 2) {
            data.targetBrightness = 0.9;
          } else {
            data.targetBrightness = 0.5;
          }
        } else {
          data.targetBrightness = 0.5;
        }

        // Smooth brightness transition
        data.brightness += (data.targetBrightness - data.brightness) * 0.1;
        orb.material.opacity = data.brightness * (0.5 + breath * 0.4);

        // Pulse size with breath
        const pulseScale = 1 + Math.sin(elapsed * 2 + data.phase) * 0.1 + breath * 0.15;
        orb.scale.setScalar(pulseScale);
      });

      // Animate wisps
      wisps.forEach(wisp => {
        const wispPositions = wisp.geometry.attributes.position.array;
        for (let j = 0; j < 30; j++) {
          const j3 = j * 3;
          wispPositions[j3] += Math.sin(elapsed * wisp.userData.speed + j * 0.2) * 0.005;
          wispPositions[j3 + 1] += Math.cos(elapsed * wisp.userData.speed * 0.7 + j * 0.1) * 0.003;
        }
        wisp.geometry.attributes.position.needsUpdate = true;
        wisp.material.opacity = 0.2 + breath * 0.2;
      });

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
      particleGeom.dispose();
      particleMat.dispose();
      whiteParticleGeom.dispose();
      whiteParticleMat.dispose();
      orbs.forEach(orb => {
        orb.geometry.dispose();
        orb.material.dispose();
      });
      wisps.forEach(wisp => {
        wisp.geometry.dispose();
        wisp.material.dispose();
      });
      renderer.dispose();
    };
  }, [currentMode, hue, getBreathPhase]);

  // ========== WAX MODE (Hyperelastic lava lamp blobs) ==========
  React.useEffect(() => {
    if (currentMode !== 'wax' || !containerRef.current || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'none';
    rendererRef.current = renderer;
    clockRef.current = new THREE.Clock();

    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };

    // Simple 3D noise function (simplex-like)
    const noise3D = (x, y, z) => {
      const p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
      const perm = [...p, ...p];
      const fade = t => t * t * t * (t * (t * 6 - 15) + 10);
      const lerp = (t, a, b) => a + t * (b - a);
      const grad = (hash, x, y, z) => {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
      };
      const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
      x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
      const u = fade(x), v = fade(y), w = fade(z);
      const A = perm[X] + Y, AA = perm[A] + Z, AB = perm[A + 1] + Z;
      const B = perm[X + 1] + Y, BA = perm[B] + Z, BB = perm[B + 1] + Z;
      return lerp(w, lerp(v, lerp(u, grad(perm[AA], x, y, z), grad(perm[BA], x-1, y, z)),
        lerp(u, grad(perm[AB], x, y-1, z), grad(perm[BB], x-1, y-1, z))),
        lerp(v, lerp(u, grad(perm[AA+1], x, y, z-1), grad(perm[BA+1], x-1, y, z-1)),
          lerp(u, grad(perm[AB+1], x, y-1, z-1), grad(perm[BB+1], x-1, y-1, z-1))));
    };

    const waxGroup = new THREE.Group();
    scene.add(waxGroup);

    // Create organic blobs
    const blobs = [];
    const numBlobs = 6;

    for (let i = 0; i < numBlobs; i++) {
      // Create icosahedron for smooth organic shape
      const baseRadius = 0.35 + Math.random() * 0.25;
      const geometry = new THREE.IcosahedronGeometry(baseRadius, 4);

      // Store original positions for displacement
      const originalPositions = geometry.attributes.position.array.slice();
      geometry.userData = { originalPositions };

      // Wireframe material matching torus aesthetic
      const material = new THREE.MeshBasicMaterial({
        color: hslToHex(hue, 52, 68),
        wireframe: true,
        transparent: true,
        opacity: 0.75,
      });

      const mesh = new THREE.Mesh(geometry, material);

      // Initial position - spread in void
      mesh.position.set(
        (Math.random() - 0.5) * 2.5,
        (Math.random() - 0.5) * 3.5,
        (Math.random() - 0.5) * 1.5
      );

      const blob = {
        mesh,
        baseRadius,
        position: mesh.position.clone(),
        velocity: new THREE.Vector3(0, 0, 0),
        phase: Math.random() * Math.PI * 2,
        floatSpeed: 0.15 + Math.random() * 0.15,
        wobbleSpeed: 0.3 + Math.random() * 0.2,
        wobbleIntensity: 0.12 + Math.random() * 0.08,
      };

      blobs.push(blob);
      waxGroup.add(mesh);
    }

    // Add subtle ambient glow particles around blobs
    const glowParticleCount = 200;
    const glowGeom = new THREE.BufferGeometry();
    const glowPositions = new Float32Array(glowParticleCount * 3);
    const glowVelocities = [];

    for (let i = 0; i < glowParticleCount; i++) {
      const i3 = i * 3;
      glowPositions[i3] = (Math.random() - 0.5) * 6;
      glowPositions[i3 + 1] = (Math.random() - 0.5) * 6;
      glowPositions[i3 + 2] = (Math.random() - 0.5) * 3;
      glowVelocities.push({
        x: (Math.random() - 0.5) * 0.005,
        y: (Math.random() - 0.5) * 0.005,
        z: (Math.random() - 0.5) * 0.003,
        phase: Math.random() * Math.PI * 2
      });
    }

    glowGeom.setAttribute('position', new THREE.BufferAttribute(glowPositions, 3));

    const glowMat = new THREE.PointsMaterial({
      color: hslToHex(hue, 45, 60),
      size: 0.02,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });

    const glowParticles = new THREE.Points(glowGeom, glowMat);
    waxGroup.add(glowParticles);

    // Touch influence tracking
    let touchInfluence = { x: 0, y: 0, z: 0, strength: 0 };

    // Spring physics state
    let localScale = 1;
    let localScaleVelocity = 0;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = clockRef.current.getElapsedTime();
      const breath = getBreathPhase(elapsed);

      // Touch-responsive rotation
      if (touchPointsRef.current.length > 0) {
        const activeTouch = touchPointsRef.current.find(p => p.active) || touchPointsRef.current[0];
        if (activeTouch) {
          const normalizedX = (activeTouch.x / window.innerWidth - 0.5) * 2;
          const normalizedY = (activeTouch.y / window.innerHeight - 0.5) * 2;
          waxGroup.rotation.y += normalizedX * 0.02;
          waxGroup.rotation.x += normalizedY * 0.01;

          // Track touch for blob attraction
          touchInfluence.x = normalizedX * 3;
          touchInfluence.y = -normalizedY * 2.5;
          touchInfluence.z = 0.5;
          touchInfluence.strength = Math.min(1, touchInfluence.strength + 0.08);
        }
      } else {
        // Gentle auto-rotation when not touching
        waxGroup.rotation.y += 0.0008;
        touchInfluence.strength *= 0.92;
      }

      // Spring-damper scale physics
      const targetScale = 0.85 + breath * 0.35;
      const springStiffness = 0.015;
      const damping = 0.85;
      const force = (targetScale - localScale) * springStiffness;
      localScaleVelocity = localScaleVelocity * damping + force;
      localScale += localScaleVelocity;
      waxGroup.scale.setScalar(localScale);

      // Z-position breathing - move toward camera on inhale
      waxGroup.position.z = (localScale - 0.85) * 2.3 - 0.3;

      // Animate each blob
      blobs.forEach((blob, index) => {
        // Lava lamp physics - vertical oscillation
        const verticalOsc = Math.sin(elapsed * blob.floatSpeed + blob.phase) * 0.4;
        blob.position.y += (verticalOsc - (blob.position.y - blob.mesh.position.y)) * 0.02;

        // Gentle horizontal drift
        blob.position.x += Math.sin(elapsed * 0.08 + blob.phase * 1.5) * 0.001;
        blob.position.z += Math.cos(elapsed * 0.06 + blob.phase * 0.7) * 0.0005;

        // Apply velocity
        blob.position.add(blob.velocity);
        blob.velocity.multiplyScalar(0.98); // Damping

        // Soft boundary limits
        if (blob.position.y > 2.2) blob.velocity.y -= 0.0003;
        if (blob.position.y < -2.2) blob.velocity.y += 0.0003;
        if (blob.position.x > 1.8) blob.velocity.x -= 0.0002;
        if (blob.position.x < -1.8) blob.velocity.x += 0.0002;
        if (blob.position.z > 1) blob.velocity.z -= 0.0001;
        if (blob.position.z < -1) blob.velocity.z += 0.0001;

        // Touch attraction - blobs drawn to touch like heat source
        if (touchInfluence.strength > 0.1) {
          const touchVec = new THREE.Vector3(touchInfluence.x, touchInfluence.y, touchInfluence.z);
          const dist = blob.position.distanceTo(touchVec);
          if (dist < 3) {
            const attractForce = touchVec.clone().sub(blob.position).normalize();
            blob.velocity.add(attractForce.multiplyScalar(0.0008 * (3 - dist) * touchInfluence.strength));
          }
        }

        // Breath sync - rise on inhale
        const breathLift = breath * 0.25;
        blob.mesh.position.x = blob.position.x;
        blob.mesh.position.y = blob.position.y + breathLift;
        blob.mesh.position.z = blob.position.z;

        // Hyperelastic deformation - noise-based vertex displacement
        const geometry = blob.mesh.geometry;
        const positions = geometry.attributes.position.array;
        const originalPositions = geometry.userData.originalPositions;
        const normal = new THREE.Vector3();

        for (let i = 0; i < positions.length; i += 3) {
          // Get original vertex position
          const ox = originalPositions[i];
          const oy = originalPositions[i + 1];
          const oz = originalPositions[i + 2];

          // Calculate normal direction
          normal.set(ox, oy, oz).normalize();

          // 4D noise for smooth time-based displacement
          const noiseVal = noise3D(
            ox * 1.5 + blob.phase,
            oy * 1.5 + elapsed * blob.wobbleSpeed,
            oz * 1.5 + elapsed * 0.15
          );

          // Apply displacement along normal
          const displacement = noiseVal * blob.wobbleIntensity * (0.8 + breath * 0.4);
          positions[i] = ox + normal.x * displacement;
          positions[i + 1] = oy + normal.y * displacement;
          positions[i + 2] = oz + normal.z * displacement;
        }

        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();

        // Stretch in direction of movement (hyperelastic)
        const speed = blob.velocity.length();
        if (speed > 0.0001) {
          const stretchFactor = 1 + speed * 15;
          // Get velocity direction
          const velDir = blob.velocity.clone().normalize();
          // Create stretch matrix aligned to velocity
          const baseScale = 0.9 + breath * 0.15;
          blob.mesh.scale.set(
            baseScale * (1 + Math.abs(velDir.x) * (stretchFactor - 1) * 0.3),
            baseScale * (1 + Math.abs(velDir.y) * (stretchFactor - 1) * 0.5),
            baseScale * (1 + Math.abs(velDir.z) * (stretchFactor - 1) * 0.3)
          );
        } else {
          const baseScale = 0.9 + breath * 0.15;
          blob.mesh.scale.setScalar(baseScale);
        }

        // Opacity with breath
        blob.mesh.material.opacity = 0.5 + breath * 0.35 + touchInfluence.strength * 0.1;
      });

      // Animate glow particles
      const glowPositionsArr = glowGeom.attributes.position.array;
      for (let i = 0; i < glowParticleCount; i++) {
        const i3 = i * 3;
        const vel = glowVelocities[i];

        glowPositionsArr[i3] += vel.x + Math.sin(elapsed * 0.3 + vel.phase) * 0.002;
        glowPositionsArr[i3 + 1] += vel.y + Math.cos(elapsed * 0.2 + vel.phase) * 0.002;
        glowPositionsArr[i3 + 2] += vel.z;

        // Wrap around
        if (glowPositionsArr[i3] > 3) glowPositionsArr[i3] = -3;
        if (glowPositionsArr[i3] < -3) glowPositionsArr[i3] = 3;
        if (glowPositionsArr[i3 + 1] > 3) glowPositionsArr[i3 + 1] = -3;
        if (glowPositionsArr[i3 + 1] < -3) glowPositionsArr[i3 + 1] = 3;
        if (glowPositionsArr[i3 + 2] > 1.5) glowPositionsArr[i3 + 2] = -1.5;
        if (glowPositionsArr[i3 + 2] < -1.5) glowPositionsArr[i3 + 2] = 1.5;
      }
      glowGeom.attributes.position.needsUpdate = true;
      glowMat.opacity = 0.25 + breath * 0.25;

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
      blobs.forEach(blob => {
        blob.mesh.geometry.dispose();
        blob.mesh.material.dispose();
      });
      glowGeom.dispose();
      glowMat.dispose();
      renderer.dispose();
    };
  }, [currentMode, hue, getBreathPhase]);

  // ========== REALM MODE (DMT-inspired hyperdimensional space) ==========
  React.useEffect(() => {
    if (currentMode !== 'realm' || !containerRef.current || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.06);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'none';
    rendererRef.current = renderer;
    clockRef.current = new THREE.Clock();

    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };

    // Spring physics refs
    let localScale = 1;
    let localScaleVelocity = 0;

    const realmGroup = new THREE.Group();
    scene.add(realmGroup);

    // === LAYER 1: THE CHRYSANTHEMUM (background) ===
    // Infinite recursive pattern radiating from center
    const chrysanthemumGroup = new THREE.Group();
    const petalMaterials = [];

    const createChrysanthemum = () => {
      const petalCount = 12;
      const layerCount = 5;

      for (let layer = 0; layer < layerCount; layer++) {
        const layerGroup = new THREE.Group();
        const depth = layer + 1;
        const scale = 1 / (depth * 0.4 + 0.6);

        for (let i = 0; i < petalCount; i++) {
          const angle = (i / petalCount) * Math.PI * 2 + layer * 0.15;

          // Create petal shape - elongated diamond
          const petalShape = new THREE.Shape();
          petalShape.moveTo(0, 0);
          petalShape.quadraticCurveTo(0.15, 0.4, 0, 0.8);
          petalShape.quadraticCurveTo(-0.15, 0.4, 0, 0);

          const petalGeom = new THREE.ShapeGeometry(petalShape);
          const petalMat = new THREE.MeshBasicMaterial({
            color: hslToHex(hue, 50, 55 + layer * 5),
            wireframe: true,
            transparent: true,
            opacity: 0.35 - layer * 0.05,
            side: THREE.DoubleSide,
          });
          petalMaterials.push(petalMat);

          const petal = new THREE.Mesh(petalGeom, petalMat);
          petal.rotation.z = angle;
          petal.position.z = -depth * 1.5;
          petal.scale.setScalar(scale * 2.5);
          petal.userData = { baseAngle: angle, layer: layer, index: i };

          layerGroup.add(petal);
        }

        chrysanthemumGroup.add(layerGroup);
      }
    };
    createChrysanthemum();
    chrysanthemumGroup.position.z = -8;
    realmGroup.add(chrysanthemumGroup);

    // === LAYER 2: ENTITY GEOMETRY (midground) ===
    // Abstract "beings" made of nested sacred geometry
    const entities = [];

    const createEntity = (position, entityHue) => {
      const entityGroup = new THREE.Group();
      entityGroup.position.copy(position);

      // Outer shell - icosahedron wireframe
      const outerGeom = new THREE.IcosahedronGeometry(0.8, 1);
      const outerMat = new THREE.MeshBasicMaterial({
        color: hslToHex(hue, 50, 60),
        wireframe: true,
        transparent: true,
        opacity: 0.5,
      });
      const outerMesh = new THREE.Mesh(outerGeom, outerMat);
      entityGroup.add(outerMesh);

      // Middle layer - dodecahedron, counter-rotating
      const middleGeom = new THREE.DodecahedronGeometry(0.55, 0);
      const middleMat = new THREE.MeshBasicMaterial({
        color: hslToHex(hue, 55, 65),
        wireframe: true,
        transparent: true,
        opacity: 0.6,
      });
      const middleMesh = new THREE.Mesh(middleGeom, middleMat);
      entityGroup.add(middleMesh);

      // Inner core - octahedron, pulsing
      const innerGeom = new THREE.OctahedronGeometry(0.35, 0);
      const innerMat = new THREE.MeshBasicMaterial({
        color: hslToHex(hue, 60, 70),
        wireframe: true,
        transparent: true,
        opacity: 0.7,
      });
      const innerMesh = new THREE.Mesh(innerGeom, innerMat);
      entityGroup.add(innerMesh);

      // "Eye" at center - off-white neutral
      const eyeGeom = new THREE.SphereGeometry(0.08, 12, 12);
      const eyeMat = new THREE.MeshBasicMaterial({
        color: hslToHex(hue, 15, 88),
        transparent: true,
        opacity: 0.9,
      });
      const eyeMesh = new THREE.Mesh(eyeGeom, eyeMat);
      entityGroup.add(eyeMesh);

      realmGroup.add(entityGroup);

      return {
        group: entityGroup,
        outer: outerMesh,
        middle: middleMesh,
        inner: innerMesh,
        eye: eyeMesh,
        materials: [outerMat, middleMat, innerMat, eyeMat],
        geometries: [outerGeom, middleGeom, innerGeom, eyeGeom],
        phase: Math.random() * Math.PI * 2,
      };
    };

    // Create 4 entities at different positions
    entities.push(createEntity(new THREE.Vector3(2.2, 0.8, -3), hue));
    entities.push(createEntity(new THREE.Vector3(-2.5, -0.6, -4), hue));
    entities.push(createEntity(new THREE.Vector3(0, 2.2, -5), hue));
    entities.push(createEntity(new THREE.Vector3(-1.5, 1.5, -6), hue));

    // === LAYER 3: TESSERACT PROJECTIONS (impossible geometry) ===
    const tesseracts = [];

    const createTesseract = (position, size) => {
      const tesseractGroup = new THREE.Group();
      tesseractGroup.position.copy(position);

      // Outer cube
      const outerGeom = new THREE.BoxGeometry(size, size, size);
      const outerMat = new THREE.MeshBasicMaterial({
        color: hslToHex(hue, 45, 55),
        wireframe: true,
        transparent: true,
        opacity: 0.4,
      });
      const outerCube = new THREE.Mesh(outerGeom, outerMat);
      tesseractGroup.add(outerCube);

      // Inner cube (smaller, rotated)
      const innerSize = size * 0.5;
      const innerGeom = new THREE.BoxGeometry(innerSize, innerSize, innerSize);
      const innerMat = new THREE.MeshBasicMaterial({
        color: hslToHex(hue, 50, 65),
        wireframe: true,
        transparent: true,
        opacity: 0.5,
      });
      const innerCube = new THREE.Mesh(innerGeom, innerMat);
      innerCube.rotation.set(Math.PI / 4, Math.PI / 4, 0);
      tesseractGroup.add(innerCube);

      // Connecting lines between vertices
      const lineGeom = new THREE.BufferGeometry();
      const linePositions = [];
      const outerVerts = [
        [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
        [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
      ].map(v => v.map(c => c * size / 2));
      const innerVerts = outerVerts.map(v => v.map(c => c * 0.5));

      for (let i = 0; i < 8; i++) {
        linePositions.push(...outerVerts[i], ...innerVerts[i]);
      }
      lineGeom.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

      const lineMat = new THREE.LineBasicMaterial({
        color: hslToHex(hue, 20, 70),
        transparent: true,
        opacity: 0.3,
      });
      const lines = new THREE.LineSegments(lineGeom, lineMat);
      tesseractGroup.add(lines);

      realmGroup.add(tesseractGroup);

      return {
        group: tesseractGroup,
        outer: outerCube,
        inner: innerCube,
        lines,
        materials: [outerMat, innerMat, lineMat],
        geometries: [outerGeom, innerGeom, lineGeom],
        phase: Math.random() * Math.PI * 2,
      };
    };

    tesseracts.push(createTesseract(new THREE.Vector3(3, -1.5, -4), 0.6));
    tesseracts.push(createTesseract(new THREE.Vector3(-3, 2, -5), 0.5));
    tesseracts.push(createTesseract(new THREE.Vector3(1.5, -2, -6), 0.45));

    // === LAYER 4: MACHINE ELVES (subtle geometric workers) ===
    const elves = [];

    const createElf = (position) => {
      const elfGroup = new THREE.Group();
      elfGroup.position.copy(position);

      // Core tetrahedron
      const coreGeom = new THREE.TetrahedronGeometry(0.12);
      const coreMat = new THREE.MeshBasicMaterial({
        color: hslToHex(hue, 55, 68),
        wireframe: true,
        transparent: true,
        opacity: 0.7,
      });
      const core = new THREE.Mesh(coreGeom, coreMat);
      elfGroup.add(core);

      // Orbiting elements - alternating primary and neutral
      const orbiters = [];
      for (let i = 0; i < 4; i++) {
        const orbiterGeom = new THREE.OctahedronGeometry(0.04);
        const isNeutral = i % 2 === 1;
        const orbiterMat = new THREE.MeshBasicMaterial({
          color: isNeutral ? hslToHex(hue, 15, 75) : hslToHex(hue, 50, 65),
          wireframe: true,
          transparent: true,
          opacity: 0.6,
        });
        const orbiter = new THREE.Mesh(orbiterGeom, orbiterMat);
        orbiters.push({
          mesh: orbiter,
          geom: orbiterGeom,
          mat: orbiterMat,
          angle: (i / 4) * Math.PI * 2,
          radius: 0.2 + Math.random() * 0.1,
          speed: 0.002 + Math.random() * 0.002,
          tilt: 0.3 + Math.random() * 0.4,
          verticalPhase: Math.random() * Math.PI * 2,
        });
        elfGroup.add(orbiter);
      }

      realmGroup.add(elfGroup);

      return {
        group: elfGroup,
        core,
        coreGeom,
        coreMat,
        orbiters,
        basePosition: position.clone(),
        phase: Math.random() * Math.PI * 2,
        driftVelocity: new THREE.Vector3(0, 0, 0),
      };
    };

    // Scatter 10 elves throughout the space
    for (let i = 0; i < 10; i++) {
      elves.push(createElf(new THREE.Vector3(
        (Math.random() - 0.5) * 7,
        (Math.random() - 0.5) * 5,
        -2 - Math.random() * 7
      )));
    }

    // === LAYER 5: THE INFINITE GRID (deep background) ===
    const gridGroup = new THREE.Group();

    const createGrid = () => {
      const gridMat = new THREE.LineBasicMaterial({
        color: hslToHex(hue, 35, 40),
        transparent: true,
        opacity: 0.15,
      });

      // Create curved grid lines
      const gridSize = 15;
      const gridSpacing = 1;

      // Horizontal lines
      for (let i = -gridSize; i <= gridSize; i += gridSpacing) {
        const points = [];
        for (let j = -gridSize; j <= gridSize; j++) {
          // Curve lines to create depth illusion
          const z = -12 - Math.abs(j) * 0.3;
          points.push(new THREE.Vector3(j, i, z));
        }
        const curve = new THREE.CatmullRomCurve3(points);
        const lineGeom = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
        const line = new THREE.Line(lineGeom, gridMat);
        gridGroup.add(line);
      }

      // Vertical lines
      for (let i = -gridSize; i <= gridSize; i += gridSpacing) {
        const points = [];
        for (let j = -gridSize; j <= gridSize; j++) {
          const z = -12 - Math.abs(j) * 0.3;
          points.push(new THREE.Vector3(i, j, z));
        }
        const curve = new THREE.CatmullRomCurve3(points);
        const lineGeom = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
        const line = new THREE.Line(lineGeom, gridMat);
        gridGroup.add(line);
      }

      return gridMat;
    };

    const gridMaterial = createGrid();
    realmGroup.add(gridGroup);

    // === AMBIENT PARTICLES ===
    const particleCount = 150;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleData = [];

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      particlePositions[i3] = (Math.random() - 0.5) * 12;
      particlePositions[i3 + 1] = (Math.random() - 0.5) * 10;
      particlePositions[i3 + 2] = -2 - Math.random() * 10;
      particleData.push({
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.002,
          (Math.random() - 0.5) * 0.002,
          (Math.random() - 0.5) * 0.001
        ),
        phase: Math.random() * Math.PI * 2,
      });
    }

    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: hslToHex(hue, 45, 70),
      size: 0.03,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeom, particleMat);
    realmGroup.add(particles);

    // Touch influence tracking
    let touchInfluence = { x: 0, y: 0, strength: 0 };

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = clockRef.current.getElapsedTime();
      const breath = getBreathPhase(elapsed);

      // === TOUCH INTERACTION ===
      if (touchPointsRef.current.length > 0) {
        const activeTouch = touchPointsRef.current.find(p => p.active) || touchPointsRef.current[0];
        if (activeTouch) {
          const normalizedX = (activeTouch.x / window.innerWidth - 0.5) * 2;
          const normalizedY = (activeTouch.y / window.innerHeight - 0.5) * 2;

          // Slower rotation - this space is vast
          realmGroup.rotation.y += normalizedX * 0.008;
          realmGroup.rotation.x += normalizedY * 0.004;

          touchInfluence.x = normalizedX * 3;
          touchInfluence.y = -normalizedY * 2.5;
          touchInfluence.strength = Math.min(1, touchInfluence.strength + 0.06);
        }
      } else {
        // Very slow auto-rotation
        realmGroup.rotation.y += 0.0003;
        touchInfluence.strength *= 0.95;
      }

      // === SPRING PHYSICS FOR SCALE ===
      const targetScale = 0.9 + breath * 0.2;
      const springStiffness = 0.012;
      const damping = 0.88;
      const force = (targetScale - localScale) * springStiffness;
      localScaleVelocity = localScaleVelocity * damping + force;
      localScale += localScaleVelocity;
      realmGroup.scale.setScalar(localScale);

      // Z-position breathing - move through the space
      const zOffset = (localScale - 0.9) * 2.5;
      realmGroup.position.z = zOffset;

      // Update fog with breath
      scene.fog.density = 0.05 + (1 - breath) * 0.02;

      // === CHRYSANTHEMUM ANIMATION ===
      chrysanthemumGroup.rotation.z += 0.0002;
      chrysanthemumGroup.children.forEach((layerGroup, layerIndex) => {
        layerGroup.rotation.z += 0.0001 * (layerIndex + 1);
        layerGroup.children.forEach((petal) => {
          // Petals fold with breath
          const foldAmount = (1 - breath) * 0.15 * (petal.userData.layer + 1) * 0.2;
          petal.rotation.x = foldAmount;

          // Subtle individual rotation
          petal.rotation.z = petal.userData.baseAngle + Math.sin(elapsed * 0.1 + petal.userData.index) * 0.02;
        });
      });

      // Update chrysanthemum colors
      petalMaterials.forEach((mat, i) => {
        mat.opacity = (0.25 + breath * 0.15) - (i % 5) * 0.03;
      });

      // === ENTITY ANIMATION ===
      entities.forEach((entity, i) => {
        // Nested counter-rotations
        entity.outer.rotation.x += 0.0008;
        entity.outer.rotation.y += 0.0012;

        entity.middle.rotation.x -= 0.0006;
        entity.middle.rotation.z += 0.0009;

        entity.inner.rotation.y += 0.0015;
        entity.inner.rotation.z -= 0.001;

        // Inner pulses with breath
        const innerScale = 0.7 + breath * 0.5;
        entity.inner.scale.setScalar(innerScale);

        // Eye tracks toward touch or gently looks around
        if (touchInfluence.strength > 0.1) {
          const lookTarget = new THREE.Vector3(touchInfluence.x, touchInfluence.y, 2);
          const currentQuat = entity.eye.quaternion.clone();
          entity.eye.lookAt(lookTarget);
          const targetQuat = entity.eye.quaternion.clone();
          entity.eye.quaternion.copy(currentQuat).slerp(targetQuat, 0.015);
        } else {
          // Gentle wandering gaze
          const wanderX = Math.sin(elapsed * 0.05 + entity.phase) * 2;
          const wanderY = Math.cos(elapsed * 0.04 + entity.phase * 1.3) * 1.5;
          entity.eye.lookAt(new THREE.Vector3(wanderX, wanderY, 3));
        }

        // Entity opacity with breath
        entity.materials.forEach((mat, j) => {
          if (j < 3) {
            mat.opacity = (0.4 + breath * 0.3) + j * 0.05;
          }
        });

        // Slight position oscillation
        entity.group.position.y += Math.sin(elapsed * 0.03 + entity.phase) * 0.0005;
      });

      // === TESSERACT ANIMATION ===
      tesseracts.forEach((tesseract) => {
        tesseract.outer.rotation.x += 0.0005;
        tesseract.outer.rotation.y += 0.0007;

        tesseract.inner.rotation.x -= 0.0008;
        tesseract.inner.rotation.z += 0.001;

        // Pulse inner cube with breath
        const innerPulse = 0.9 + breath * 0.2;
        tesseract.inner.scale.setScalar(innerPulse);

        tesseract.materials.forEach(mat => {
          mat.opacity = 0.3 + breath * 0.2;
        });
      });

      // === ELF ANIMATION ===
      elves.forEach((elf) => {
        // Core morphs and rotates
        const morphPhase = elapsed * 0.08 + elf.phase;
        elf.core.scale.set(
          1 + Math.sin(morphPhase) * 0.25,
          1 + Math.sin(morphPhase * 1.3) * 0.25,
          1 + Math.sin(morphPhase * 0.7) * 0.25
        );
        elf.core.rotation.x += 0.003;
        elf.core.rotation.y += 0.004;

        // Orbiters circle
        elf.orbiters.forEach((orbiter) => {
          orbiter.angle += orbiter.speed;
          orbiter.mesh.position.set(
            Math.cos(orbiter.angle) * orbiter.radius,
            Math.sin(elapsed * 0.1 + orbiter.verticalPhase) * orbiter.radius * orbiter.tilt,
            Math.sin(orbiter.angle) * orbiter.radius
          );
          orbiter.mesh.rotation.x += 0.01;
          orbiter.mesh.rotation.y += 0.015;
        });

        // Elves drift away from touch (shy)
        if (touchInfluence.strength > 0.1) {
          const dx = elf.group.position.x - touchInfluence.x;
          const dy = elf.group.position.y - touchInfluence.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 3) {
            const repelStrength = (3 - dist) / 3 * 0.003 * touchInfluence.strength;
            elf.driftVelocity.x += (dx / dist) * repelStrength;
            elf.driftVelocity.y += (dy / dist) * repelStrength;
          }
        }

        // Apply drift with damping
        elf.group.position.add(elf.driftVelocity);
        elf.driftVelocity.multiplyScalar(0.98);

        // Gentle return to base position
        elf.group.position.lerp(elf.basePosition, 0.001);

        // Opacity with breath
        elf.coreMat.opacity = 0.5 + breath * 0.3;
        elf.orbiters.forEach(o => {
          o.mat.opacity = 0.4 + breath * 0.3;
        });
      });

      // === GRID ANIMATION ===
      gridMaterial.opacity = 0.1 + breath * 0.08;
      gridGroup.rotation.z += 0.00005;

      // === PARTICLE ANIMATION ===
      const positions = particleGeom.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const data = particleData[i];

        positions[i3] += data.velocity.x + Math.sin(elapsed * 0.1 + data.phase) * 0.001;
        positions[i3 + 1] += data.velocity.y + Math.cos(elapsed * 0.08 + data.phase) * 0.001;
        positions[i3 + 2] += data.velocity.z;

        // Wrap around
        if (positions[i3] > 6) positions[i3] = -6;
        if (positions[i3] < -6) positions[i3] = 6;
        if (positions[i3 + 1] > 5) positions[i3 + 1] = -5;
        if (positions[i3 + 1] < -5) positions[i3 + 1] = 5;
        if (positions[i3 + 2] > -2) positions[i3 + 2] = -12;
        if (positions[i3 + 2] < -12) positions[i3 + 2] = -2;
      }
      particleGeom.attributes.position.needsUpdate = true;
      particleMat.opacity = 0.3 + breath * 0.3;

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
      // Dispose chrysanthemum
      chrysanthemumGroup.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      // Dispose entities
      entities.forEach(entity => {
        entity.geometries.forEach(g => g.dispose());
        entity.materials.forEach(m => m.dispose());
      });
      // Dispose tesseracts
      tesseracts.forEach(t => {
        t.geometries.forEach(g => g.dispose());
        t.materials.forEach(m => m.dispose());
      });
      // Dispose elves
      elves.forEach(elf => {
        elf.coreGeom.dispose();
        elf.coreMat.dispose();
        elf.orbiters.forEach(o => {
          o.geom.dispose();
          o.mat.dispose();
        });
      });
      // Dispose grid
      gridGroup.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      // Dispose particles
      particleGeom.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, [currentMode, hue, getBreathPhase]);

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
      {(currentMode === 'geometry' || currentMode === 'jellyfish' || currentMode === 'flowerOfLife' || currentMode === 'mushrooms' || currentMode === 'tree' || currentMode === 'fern' || currentMode === 'dandelion' || currentMode === 'succulent' || currentMode === 'ripples' || currentMode === 'lungs' || currentMode === 'koiPond' || currentMode === 'bioluminescent' || currentMode === 'wax' || currentMode === 'realm') && (
        <div ref={containerRef} style={{
          width: '100%',
          height: '100%',
          pointerEvents: currentMode === 'jellyfish' ? 'auto' : 'none'
        }} />
      )}

      {/* Canvas for 2D modes */}
      {currentMode !== 'geometry' && currentMode !== 'jellyfish' && currentMode !== 'flowerOfLife' && currentMode !== 'mushrooms' && currentMode !== 'tree' && currentMode !== 'fern' && currentMode !== 'dandelion' && currentMode !== 'succulent' && currentMode !== 'ripples' && currentMode !== 'lungs' && currentMode !== 'koiPond' && currentMode !== 'bioluminescent' && currentMode !== 'wax' && currentMode !== 'realm' && (
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', pointerEvents: 'none' }} />
      )}

      {/* Visual name toast - appears briefly when switching visuals (hidden in background mode) */}
      {!backgroundMode && (
        <div
          style={{
            position: 'absolute',
            bottom: '2.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            opacity: showVisualToast ? 1 : 0,
            transition: 'opacity 0.4s ease-in-out',
          }}
        >
          <span
            style={{
              color: `hsla(${hue}, 52%, 68%, 0.7)`,
              fontSize: '0.7rem',
              fontFamily: '"Jost", sans-serif',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            {gazeModes.find(m => m.key === currentMode)?.name || ''}
          </span>
        </div>
      )}

      {/* DISABLED: Swipe hint removed - menu disabled for minimal experience */}
      {/* {!showUI && (
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
      )} */}

      {/* DISABLED: Visual selector drawer - menu disabled for minimal experience (left/right swipe only) */}
      {/* To re-enable: uncomment this block and the swipe-up gesture handlers above */}
      {/* {showUI && (
        <>
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
      )} */}
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

// ============================================================================
// BREATHWORK VIEW COMPONENT
// ============================================================================

// Convert number to Roman numeral
const toRoman = (num) => {
  if (num <= 0 || num > 20) return num.toString();
  const numerals = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
                    'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'];
  return numerals[num] || num.toString();
};

function BreathworkView({ breathSession, breathTechniques, startBreathSession, stopBreathSession, primaryHue = 162, primaryColor = 'hsl(162, 52%, 68%)', currentVisual = 'geometry', onVisualChange }) {
  const [showUI, setShowUI] = useState(false);
  const [showVisualToast, setShowVisualToast] = useState(false);
  const swipeStartRef = useRef(null);
  const wheelAccumRef = useRef(0);
  const wheelTimeoutRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  // Cycle through visuals (using filtered breathworkModes)
  const cycleVisual = useCallback((direction) => {
    const currentIndex = breathworkModes.findIndex(m => m.key === currentVisual);
    let newIndex;
    if (direction > 0) {
      newIndex = (currentIndex + 1) % breathworkModes.length;
    } else {
      newIndex = (currentIndex - 1 + breathworkModes.length) % breathworkModes.length;
    }
    onVisualChange(breathworkModes[newIndex].key);
    setShowVisualToast(true);
    haptic.tap();
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setShowVisualToast(false), 1500);
  }, [currentVisual, onVisualChange]);

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

    // Horizontal swipe: cycle visuals (only when menu is closed)
    if (!showUI && Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaX) > Math.abs(deltaY) * 1.5 && deltaTime < maxSwipeTime) {
      cycleVisual(deltaX < 0 ? 1 : -1); // Swipe left = next, swipe right = previous
    }

    swipeStartRef.current = null;
  }, [showUI, cycleVisual]);

  // Two-finger swipe (wheel event on trackpad) to cycle visuals or open menu
  const showUIRef = useRef(showUI);
  showUIRef.current = showUI;
  const wheelAccumXRef = useRef(0);

  useEffect(() => {
    const handleWheel = (e) => {
      // When menu is open, let scroll pass through naturally
      if (showUIRef.current) return;

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
        cycleVisual(wheelAccumXRef.current > 0 ? 1 : -1);
        wheelAccumXRef.current = 0;
        wheelAccumRef.current = 0;
      }
      // Swipe UP = open menu
      else if (wheelAccumRef.current > threshold) {
        e.preventDefault();
        setShowUI(true);
        wheelAccumRef.current = 0;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [cycleVisual]);

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
      {/* Visual background - uses GazeMode component */}
      <GazeMode
        primaryHue={primaryHue}
        backgroundMode={true}
        currentVisual={currentVisual}
        onVisualChange={onVisualChange}
        breathSession={breathSession}
      />

      {/* Visual name toast - appears briefly when switching visuals */}
      <div
        style={{
          position: 'absolute',
          bottom: '6rem',
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
          opacity: showVisualToast ? 1 : 0,
          transition: 'opacity 0.4s ease-in-out',
          zIndex: 5,
        }}
      >
        <span
          style={{
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '0.9rem',
            fontFamily: '"Jost", sans-serif',
            letterSpacing: '0.3em',
            textTransform: 'lowercase',
          }}
        >
          {breathworkModes.find(m => m.key === currentVisual)?.name || ''}
        </span>
      </div>

      {/* Phase text - centered */}
      {breathSession.isActive && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}>
          <div style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '1.5rem',
            fontFamily: '"Jost", sans-serif',
            fontWeight: 300,
            letterSpacing: '0.2em',
            textTransform: 'lowercase',
            textAlign: 'center',
            maxWidth: '80vw',
          }}>
            {breathTechniques[breathSession.technique]?.phases[breathSession.phaseIndex]?.label || 'breathe'}
          </div>
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
// DRONE MODE COMPONENT
// ============================================================================

function DroneMode({ primaryHue = 162, primaryColor = 'hsl(162, 52%, 68%)', backgroundMode = false }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentInstrument, setCurrentInstrument] = useState(2); // synth
  const [currentTexture, setCurrentTexture] = useState(3); // forest
  const [showLabel, setShowLabel] = useState(false);
  const [breathPhase, setBreathPhase] = useState('inhale');
  const [breathValue, setBreathValue] = useState(0);

  // Touch ref for forwarding to GazeMode ripples
  const externalTouchRef = useRef([]);

  const ctxRef = useRef(null);
  const masterGainRef = useRef(null);
  const reverbNodeRef = useRef(null);
  const reverbGainRef = useRef(null);
  const dryGainRef = useRef(null);
  const droneOscillatorsRef = useRef([]);
  const noiseNodeRef = useRef(null);
  const noiseGainRef = useRef(null);
  const foleyIntervalRef = useRef(null);
  const breathStartTimeRef = useRef(null);
  const animationFrameRef = useRef(null);
  const labelTimeoutRef = useRef(null);
  const wheelAccumXRef = useRef(0);
  const wheelAccumYRef = useRef(0);
  const wheelTimeoutRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const lastTouchRef = useRef({ x: 0, y: 0 });
  const currentTextureRef = useRef(currentTexture);
  currentTextureRef.current = currentTexture;
  const pianoBufferRef = useRef(null);
  const guitarBufferRef = useRef(null);
  const harpBufferRef = useRef(null);
  const celloBufferRef = useRef(null);

  // Breath pattern (4-7-8)
  const breathPattern = { inhale: 4, hold: 7, exhale: 8 };

  const instruments = [
    { name: 'piano', type: 'sampledPiano' },
    { name: 'guitar', type: 'sampledGuitar' },
    { name: 'synth', type: 'feltPiano' },
    { name: 'singing bowl', type: 'singingBowl' },
    { name: 'music box', type: 'musicBox' },
    { name: 'harp', type: 'sampledHarp' },
    { name: 'cello', type: 'sampledCello' }
  ];

  const textures = [
    { name: 'silence', noise: 0, foley: false },
    { name: 'room tone', noise: 0.008, foley: false },
    { name: 'rain', noise: 0, foley: true, foleyType: 'rain' },
    { name: 'forest', noise: 0, foley: true, foleyType: 'forest' },
    { name: 'water', noise: 0, foley: true, foleyType: 'water' },
    { name: 'night', noise: 0, foley: true, foleyType: 'night' }
  ];

  // A minor pentatonic scale (A2 to A5)
  const scale = [
    110.00, 130.81, 146.83, 164.81, 196.00, 220.00,
    261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 659.25, 880.00
  ];

  // Initialize audio context
  const initAudio = useCallback(() => {
    if (ctxRef.current) return;

    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    ctxRef.current = ctx;

    // Resume context (required for mobile browsers)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.7;
    masterGainRef.current = masterGain;

    // Create reverb
    const reverbNode = ctx.createConvolver();
    const reverbLength = 6;
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * reverbLength;
    const impulse = ctx.createBuffer(2, length, sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        const earlyDecay = Math.exp(-t * 3) * 0.3;
        const lateDecay = Math.exp(-t * 0.8) * 0.7;
        data[i] = (Math.random() * 2 - 1) * (earlyDecay + lateDecay);
      }
    }
    reverbNode.buffer = impulse;
    reverbNodeRef.current = reverbNode;

    const reverbGain = ctx.createGain();
    reverbGain.gain.value = 0.5;
    reverbGainRef.current = reverbGain;

    const dryGain = ctx.createGain();
    dryGain.gain.value = 0.6;
    dryGainRef.current = dryGain;

    masterGain.connect(dryGain);
    dryGain.connect(ctx.destination);
    masterGain.connect(reverbNode);
    reverbNode.connect(reverbGain);
    reverbGain.connect(ctx.destination);

    // Load piano sample (C3 = 130.81Hz base note)
    fetch('piano.mp3')
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        pianoBufferRef.current = audioBuffer;
      })
      .catch(err => console.log('Piano sample not loaded:', err));

    // Load guitar sample (C3 = 130.81Hz base note)
    fetch('guitar.mp3')
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        guitarBufferRef.current = audioBuffer;
      })
      .catch(err => console.log('Guitar sample not loaded:', err));

    // Load harp sample (C3 = 130.81Hz base note)
    fetch('harp.mp3')
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        harpBufferRef.current = audioBuffer;
      })
      .catch(err => console.log('Harp sample not loaded:', err));

    // Load cello sample (C3 = 130.81Hz base note)
    fetch('cello.mp3')
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        celloBufferRef.current = audioBuffer;
      })
      .catch(err => console.log('Cello sample not loaded:', err));

    // Start drone
    startDrone(ctx, masterGain);

    // Start textures
    startTextures(ctx, masterGain);

    // Start breath loop
    breathStartTimeRef.current = performance.now();
    const updateBreath = (timestamp) => {
      if (!breathStartTimeRef.current) breathStartTimeRef.current = timestamp;

      const totalCycle = breathPattern.inhale + breathPattern.hold + breathPattern.exhale;
      const elapsed = ((timestamp - breathStartTimeRef.current) / 1000) % totalCycle;

      let phase, value;
      if (elapsed < breathPattern.inhale) {
        phase = 'inhale';
        value = elapsed / breathPattern.inhale;
      } else if (elapsed < breathPattern.inhale + breathPattern.hold) {
        phase = 'hold';
        value = 1;
      } else {
        phase = 'exhale';
        value = 1 - (elapsed - breathPattern.inhale - breathPattern.hold) / breathPattern.exhale;
      }

      setBreathPhase(phase);
      setBreathValue(value);

      // Modulate drone
      droneOscillatorsRef.current.forEach(node => {
        const target = node.baseGain * (0.4 + value * 0.6);
        node.gain.gain.setTargetAtTime(target, ctx.currentTime, 0.5);
      });

      animationFrameRef.current = requestAnimationFrame(updateBreath);
    };
    animationFrameRef.current = requestAnimationFrame(updateBreath);

    setIsInitialized(true);
  }, []);

  // Start drone oscillators
  const startDrone = (ctx, masterGain) => {
    const baseFreq = 55; // A1
    const layers = [
      { ratio: 1, type: 'sine', gain: 0.15, detune: 0 },
      { ratio: 2, type: 'sine', gain: 0.12, detune: 3 },
      { ratio: 1.5, type: 'sine', gain: 0.08, detune: -2 },
      { ratio: 3, type: 'sine', gain: 0.05, detune: 5 },
      { ratio: 4, type: 'sine', gain: 0.03, detune: -4 },
      { ratio: 0.5, type: 'sine', gain: 0.1, detune: 0 },
      { ratio: 2.01, type: 'sine', gain: 0.04, detune: 0 },
      { ratio: 1.498, type: 'sine', gain: 0.03, detune: 0 }
    ];

    layers.forEach(layer => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const panner = ctx.createStereoPanner();

      osc.type = layer.type;
      osc.frequency.value = baseFreq * layer.ratio;
      osc.detune.value = layer.detune;

      gain.gain.value = 0;
      panner.pan.value = (Math.random() - 0.5) * 0.3;

      osc.connect(gain);
      gain.connect(panner);
      panner.connect(masterGain);

      osc.start();
      gain.gain.setTargetAtTime(layer.gain, ctx.currentTime, 0.3);

      droneOscillatorsRef.current.push({ osc, gain, baseGain: layer.gain });
    });
  };

  // Start texture noise
  const startTextures = (ctx, masterGain) => {
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;
    noiseNodeRef.current = noiseNode;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 2000;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = textures[0].noise;
    noiseGainRef.current = noiseGain;

    noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noiseNode.start();

    // Foley interval - use ref to get current texture value
    foleyIntervalRef.current = setInterval(() => {
      const tex = textures[currentTextureRef.current];
      if (tex && tex.foley) {
        playFoley(ctx, masterGain, tex.foleyType);
      }
    }, 1500 + Math.random() * 2000);
  };

  // Foley sounds
  const playFoley = (ctx, masterGain, type) => {
    if (Math.random() > 0.4) return;
    const now = ctx.currentTime;

    if (type === 'rain') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 1000 + Math.random() * 500;
      osc.frequency.setTargetAtTime(400 + Math.random() * 200, now, 0.02);
      gain.gain.value = 0.015;
      gain.gain.setTargetAtTime(0, now, 0.08);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'forest') {
      if (Math.random() > 0.5) {
        // Bird chirp
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const baseFreq = 2000 + Math.random() * 1500;
        osc.frequency.value = baseFreq;
        osc.frequency.setTargetAtTime(baseFreq * 1.2, now, 0.03);
        osc.frequency.setTargetAtTime(baseFreq * 0.9, now + 0.05, 0.02);
        gain.gain.value = 0;
        gain.gain.setTargetAtTime(0.02, now, 0.01);
        gain.gain.setTargetAtTime(0, now + 0.08, 0.03);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.2);
      } else {
        // Leaf rustle
        const noise = ctx.createBufferSource();
        const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.03));
        }
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 3000;
        const gain = ctx.createGain();
        gain.gain.value = 0.01;
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        noise.start(now);
      }
    } else if (type === 'water') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 200 + Math.random() * 150;
      osc.frequency.setTargetAtTime(400 + Math.random() * 200, now, 0.03);
      gain.gain.value = 0.015;
      gain.gain.setTargetAtTime(0, now, 0.1);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'night') {
      if (Math.random() > 0.7) {
        // Cricket
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 4000 + Math.random() * 1000;
        lfo.frequency.value = 30 + Math.random() * 20;
        lfoGain.gain.value = 0.01;
        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);
        gain.gain.value = 0.01;
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        lfo.start(now);
        osc.stop(now + 0.1 + Math.random() * 0.1);
        lfo.stop(now + 0.2);
      }
    }
  };

  // Play instrument
  const playInstrument = useCallback((freq, velocity = 0.8) => {
    const ctx = ctxRef.current;
    const masterGain = masterGainRef.current;
    if (!ctx || !masterGain) return;

    const type = instruments[currentInstrument].type;
    const now = ctx.currentTime;

    if (type === 'sampledPiano') {
      // Sampled piano - pitch shift from base note (C3 = 130.81Hz)
      // Limit range to ~1.5 octaves up to keep it sounding natural
      if (!pianoBufferRef.current) return;

      const baseFreq = 130.81; // C3 - middle of the sample range
      let adjustedFreq = freq;
      // If note is too high, drop it down an octave (or two)
      while (adjustedFreq / baseFreq > 2.5) {
        adjustedFreq = adjustedFreq / 2;
      }
      const playbackRate = adjustedFreq / baseFreq;

      const source = ctx.createBufferSource();
      source.buffer = pianoBufferRef.current;
      source.playbackRate.value = playbackRate;

      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.gain.setTargetAtTime(0.8 * velocity, now, 0.01);
      gain.gain.setTargetAtTime(0.5 * velocity, now + 0.1, 0.3);
      gain.gain.setTargetAtTime(0, now + 0.5, 2.0);

      source.connect(gain);
      gain.connect(masterGain);
      source.start(now);
    } else if (type === 'sampledGuitar') {
      // Sampled guitar - pitch shift from base note (C3 = 130.81Hz)
      // Limit range to keep it sounding natural (drop high notes down)
      if (!guitarBufferRef.current) return;

      const baseFreq = 130.81; // C3
      let adjustedFreq = freq;
      // If note is too high, drop it down an octave (or more)
      while (adjustedFreq / baseFreq > 1.5) {
        adjustedFreq = adjustedFreq / 2;
      }
      const playbackRate = adjustedFreq / baseFreq;

      const source = ctx.createBufferSource();
      source.buffer = guitarBufferRef.current;
      source.playbackRate.value = playbackRate;

      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.gain.setTargetAtTime(0.8 * velocity, now, 0.01);
      gain.gain.setTargetAtTime(0.5 * velocity, now + 0.15, 0.4);
      gain.gain.setTargetAtTime(0, now + 0.8, 2.5);

      source.connect(gain);
      gain.connect(masterGain);
      source.start(now);
    } else if (type === 'feltPiano') {
      // FM synthesis for warm character
      const carrier = ctx.createOscillator();
      const modulator = ctx.createOscillator();
      const modGain = ctx.createGain();
      const mainGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      modulator.frequency.value = freq * 2;
      modGain.gain.value = freq * 0.5;
      modulator.connect(modGain);
      modGain.connect(carrier.frequency);

      carrier.type = 'triangle';
      carrier.frequency.value = freq;

      filter.type = 'lowpass';
      filter.frequency.value = freq * 4;
      filter.Q.value = 0.5;
      filter.frequency.setTargetAtTime(freq * 1.5, now, 0.3);

      mainGain.gain.value = 0;
      mainGain.gain.setTargetAtTime(0.25 * velocity, now, 0.01);
      mainGain.gain.setTargetAtTime(0.15 * velocity, now + 0.1, 0.2);
      mainGain.gain.setTargetAtTime(0, now + 0.3, 1.5);

      carrier.connect(filter);
      filter.connect(mainGain);
      mainGain.connect(masterGain);

      carrier.start(now);
      modulator.start(now);
      carrier.stop(now + 4);
      modulator.stop(now + 4);
    } else if (type === 'singingBowl') {
      const bowlPartials = [
        { ratio: 1.0, amp: 1.0, decay: 2 },
        { ratio: 1.002, amp: 0.8, decay: 2 },
        { ratio: 2.71, amp: 0.5, decay: 1.5 },
        { ratio: 2.73, amp: 0.4, decay: 1.5 },
        { ratio: 5.15, amp: 0.25, decay: 1 },
        { ratio: 5.18, amp: 0.2, decay: 1 },
        { ratio: 8.42, amp: 0.1, decay: 0.8 },
      ];

      bowlPartials.forEach((partial) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq * partial.ratio;
        const amp = 0.02 * partial.amp * velocity;
        gain.gain.value = 0;
        gain.gain.setTargetAtTime(amp, now, 0.01);
        gain.gain.setTargetAtTime(amp * 0.7, now + 0.1, 0.2);
        gain.gain.setTargetAtTime(0, now + 0.5, partial.decay);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + partial.decay * 3 + 2);
      });
    } else if (type === 'musicBox') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq * 2;
      gain.gain.value = 0;
      gain.gain.setTargetAtTime(0.2 * velocity, now, 0.001);
      gain.gain.setTargetAtTime(0, now + 0.1, 0.6);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 2);
    } else if (type === 'sampledHarp') {
      // Sampled harp - pitch shift from base note (C3 = 130.81Hz)
      if (!harpBufferRef.current) return;

      const baseFreq = 130.81; // C3
      const playbackRate = freq / baseFreq;

      const source = ctx.createBufferSource();
      source.buffer = harpBufferRef.current;
      source.playbackRate.value = playbackRate;

      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.gain.setTargetAtTime(0.5 * velocity, now, 0.01);
      gain.gain.setTargetAtTime(0.35 * velocity, now + 0.1, 0.3);
      gain.gain.setTargetAtTime(0, now + 0.5, 3.0);

      source.connect(gain);
      gain.connect(masterGain);
      source.start(now);
    } else if (type === 'sampledCello') {
      // Sampled cello - pitch shift from base note (C3 = 130.81Hz)
      if (!celloBufferRef.current) return;

      const baseFreq = 130.81; // C3
      let adjustedFreq = freq;
      // Limit range for natural sound
      while (adjustedFreq / baseFreq > 2.5) {
        adjustedFreq = adjustedFreq / 2;
      }
      const playbackRate = adjustedFreq / baseFreq;

      const source = ctx.createBufferSource();
      source.buffer = celloBufferRef.current;
      source.playbackRate.value = playbackRate;

      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.gain.setTargetAtTime(0.7 * velocity, now, 0.02);
      gain.gain.setTargetAtTime(0.5 * velocity, now + 0.2, 0.5);
      gain.gain.setTargetAtTime(0, now + 1.0, 3.5);

      source.connect(gain);
      gain.connect(masterGain);
      source.start(now);
    }

    haptic.tap();
  }, [currentInstrument]);

  // Update texture
  const updateTexture = useCallback((newTexture) => {
    setCurrentTexture(newTexture);
    if (noiseGainRef.current && ctxRef.current) {
      noiseGainRef.current.gain.setTargetAtTime(textures[newTexture].noise, ctxRef.current.currentTime, 0.5);
    }
  }, []);

  // Show label
  const displayLabel = useCallback(() => {
    setShowLabel(true);
    if (labelTimeoutRef.current) clearTimeout(labelTimeoutRef.current);
    labelTimeoutRef.current = setTimeout(() => setShowLabel(false), 1500);
  }, []);

  // Show label when drone initializes
  useEffect(() => {
    if (isInitialized && !backgroundMode) {
      displayLabel();
    }
  }, [isInitialized, backgroundMode, displayLabel]);

  // Handle touch start
  const handleTouchStart = useCallback((e) => {
    if (backgroundMode) return;
    if (!isInitialized) {
      initAudio();
    }

    const clientX = e.touches[0].clientX;
    const clientY = e.touches[0].clientY;
    touchStartRef.current = { x: clientX, y: clientY, time: Date.now() };
    lastTouchRef.current = { x: clientX, y: clientY };
  }, [backgroundMode, isInitialized, initAudio]);

  // Handle touch move
  const handleTouchMove = useCallback((e) => {
    if (backgroundMode || !isInitialized) return;
    lastTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, [backgroundMode, isInitialized]);

  // Handle touch end - detect swipe vs tap
  const handleTouchEnd = useCallback((e) => {
    if (backgroundMode || !ctxRef.current) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - touchStartRef.current.x;
    const deltaY = endY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;

    const swipeThreshold = 50;
    const isSwipe = Math.abs(deltaX) > swipeThreshold || Math.abs(deltaY) > swipeThreshold;

    if (isSwipe && deltaTime < 500) {
      // It's a swipe - change instrument or texture
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe - change instrument
        const dir = deltaX > 0 ? -1 : 1;
        setCurrentInstrument(prev => (prev + dir + instruments.length) % instruments.length);
        displayLabel();
        haptic.tap();
      } else {
        // Vertical swipe - change texture
        const dir = deltaY > 0 ? -1 : 1;
        const newTexture = (currentTexture + dir + textures.length) % textures.length;
        updateTexture(newTexture);
        displayLabel();
        haptic.tap();
      }
    } else {
      // It's a tap - play instrument
      const clientY = touchStartRef.current.y;
      const clientX = touchStartRef.current.x;
      const normalizedY = 1 - (clientY / window.innerHeight);
      const noteIndex = Math.floor(normalizedY * scale.length);
      const freq = scale[Math.max(0, Math.min(scale.length - 1, noteIndex))];

      playInstrument(freq, 0.6 + breathValue * 0.4);

      // Forward touch to GazeMode for ripples
      externalTouchRef.current.push({
        id: `drone-${Date.now()}`,
        x: clientX,
        y: clientY,
        time: Date.now(),
      });

      // Create ripple
      const container = e.target.closest('main');
      if (container) {
        const ripple = document.createElement('div');
        ripple.style.cssText = `
          position: absolute;
          left: ${clientX}px;
          top: ${clientY}px;
          width: 100px;
          height: 100px;
          border: 1px solid hsla(${primaryHue}, 52%, 68%, 0.4);
          border-radius: 50%;
          pointer-events: none;
          animation: droneRipple 1.5s ease-out forwards;
          transform: translate(-50%, -50%) scale(0);
        `;
        container.appendChild(ripple);
        setTimeout(() => ripple.remove(), 1500);
      }
    }
  }, [backgroundMode, playInstrument, breathValue, primaryHue, currentTexture, updateTexture, displayLabel]);

  // Handle click (for desktop)
  const handleClick = useCallback((e) => {
    if (backgroundMode) return;
    if (!isInitialized) {
      initAudio();
    }
    if (!ctxRef.current) return;

    const clientY = e.clientY;
    const clientX = e.clientX;
    const normalizedY = 1 - (clientY / window.innerHeight);
    const noteIndex = Math.floor(normalizedY * scale.length);
    const freq = scale[Math.max(0, Math.min(scale.length - 1, noteIndex))];

    playInstrument(freq, 0.6 + breathValue * 0.4);

    // Create ripple
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      left: ${clientX}px;
      top: ${clientY}px;
      width: 100px;
      height: 100px;
      border: 1px solid hsla(${primaryHue}, 52%, 68%, 0.4);
      border-radius: 50%;
      pointer-events: none;
      animation: droneRipple 1.5s ease-out forwards;
      transform: translate(-50%, -50%) scale(0);
    `;
    e.currentTarget.appendChild(ripple);
    setTimeout(() => ripple.remove(), 1500);
  }, [backgroundMode, isInitialized, initAudio, playInstrument, breathValue, primaryHue]);

  // Handle scroll for instrument/texture change
  useEffect(() => {
    const handleWheel = (e) => {
      if (!isInitialized) return;

      wheelAccumXRef.current += e.deltaX;
      wheelAccumYRef.current += e.deltaY;

      if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
      wheelTimeoutRef.current = setTimeout(() => {
        wheelAccumXRef.current = 0;
        wheelAccumYRef.current = 0;
      }, 200);

      const threshold = 30;

      if (Math.abs(wheelAccumXRef.current) > Math.abs(wheelAccumYRef.current)) {
        // Horizontal: change instrument
        if (Math.abs(wheelAccumXRef.current) > threshold) {
          e.preventDefault();
          const dir = wheelAccumXRef.current > 0 ? 1 : -1;
          setCurrentInstrument(prev => (prev + dir + instruments.length) % instruments.length);
          displayLabel();
          haptic.tap();
          wheelAccumXRef.current = 0;
          wheelAccumYRef.current = 0;
        }
      } else {
        // Vertical: change texture
        if (Math.abs(wheelAccumYRef.current) > threshold) {
          e.preventDefault();
          const dir = wheelAccumYRef.current > 0 ? 1 : -1;
          const newTexture = (currentTexture + dir + textures.length) % textures.length;
          updateTexture(newTexture);
          displayLabel();
          haptic.tap();
          wheelAccumXRef.current = 0;
          wheelAccumYRef.current = 0;
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isInitialized, currentTexture, updateTexture, displayLabel]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (foleyIntervalRef.current) clearInterval(foleyIntervalRef.current);
      if (labelTimeoutRef.current) clearTimeout(labelTimeoutRef.current);
      droneOscillatorsRef.current.forEach(node => {
        try { node.osc.stop(); } catch {}
      });
      if (noiseNodeRef.current) {
        try { noiseNodeRef.current.stop(); } catch {}
      }
      if (ctxRef.current) {
        try { ctxRef.current.close(); } catch {}
      }
    };
  }, []);

  // In background mode, just keep audio alive without UI
  if (backgroundMode) {
    return null;
  }

  return (
    <main
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'absolute',
        inset: 0,
        background: '#000',
        touchAction: 'none',
        userSelect: 'none',
        cursor: 'pointer',
        overflow: 'hidden',
      }}
    >
      {/* Ripples visual background */}
      <GazeMode
        primaryHue={primaryHue}
        backgroundMode={true}
        currentVisual="ripples"
        breathSession={{
          isActive: isInitialized,
          phase: breathPhase,
          phaseProgress: breathValue,
        }}
        externalTouchRef={externalTouchRef}
      />

      {/* Center label */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
          opacity: showLabel ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
      >
        <div style={{
          fontSize: '2rem',
          letterSpacing: '0.3em',
          textTransform: 'lowercase',
          color: '#fff',
          marginBottom: '0.5rem',
          fontWeight: 300,
        }}>
          {instruments[currentInstrument].name}
        </div>
        <div style={{
          fontSize: '0.9rem',
          letterSpacing: '0.3em',
          textTransform: 'lowercase',
          color: 'rgba(255, 255, 255, 0.5)',
        }}>
          {textures[currentTexture].name}
        </div>
      </div>

      <style>{`
        @keyframes droneRipple {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0.4; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
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
];

function Still() {
  // Core state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedQuotes, setSavedQuotes] = useState([]);
  const [shuffledQuotes, setShuffledQuotes] = useState([]);
  const [view, setView] = useState('drone');
  const [selectedSchools, setSelectedSchools] = useState(new Set());
  const [selectedThemes, setSelectedThemes] = useState(new Set());
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [toast, setToast] = useState(null);
  const [settings, setSettings] = useState(defaultSettings);
  const [showColorOverlay, setShowColorOverlay] = useState(false);
  const [gazeVisual, setGazeVisual] = useState('geometry');
  const [breathVisual, setBreathVisual] = useState('geometry');

  // Music player state
  const [musicOpen, setMusicOpen] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
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
  const touchStartX = useRef(0);
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
    isComplete: false,
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

    haptic.medium(); // Haptic feedback on session start

    setBreathSession({
      technique: techniqueName,
      isActive: true,
      isPaused: false,
      isComplete: false,
      phase: technique.phases[0].name,
      phaseIndex: 0,
      phaseProgress: 0,
      cycleCount: 0,
      sessionTime: 0,
      totalCycles: technique.recommendedCycles || 10,
    });
  }, []);

  const stopBreathSession = useCallback(() => {
    setBreathSession(prev => ({ ...prev, isActive: false, isPaused: false, isComplete: false }));
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

        // Haptic feedback for phase transition
        const newPhaseName = technique.phases[currentPhaseIndex].name.toLowerCase();
        if (newPhaseName.includes('inhale') || newPhaseName.includes('in')) {
          haptic.inhale();
        } else if (newPhaseName.includes('exhale') || newPhaseName.includes('out')) {
          haptic.exhale();
        } else if (newPhaseName.includes('hold')) {
          haptic.hold();
        }

        // Count cycle when we return to first phase
        if (currentPhaseIndex === 0) {
          currentCycleCount++;

          // Check if session is complete
          if (currentCycleCount >= breathSession.totalCycles) {
            haptic.success(); // Haptic feedback on session complete
            setBreathSession(prev => ({
              ...prev,
              isActive: false,
              isComplete: true,
              cycleCount: currentCycleCount,
              sessionTime: Math.floor(sessionTime),
            }));
            return; // Stop animation
          }
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
  }, [breathSession.isActive, breathSession.isPaused, breathSession.technique, breathSession.totalCycles]);

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

  const wheelAccumX = useRef(0);

  const handleWheel = useCallback((e) => {
    if (view !== 'scroll' || isAnimating.current) return;
    e.preventDefault();

    // Horizontal scroll - change visual
    wheelAccumX.current += e.deltaX;
    if (Math.abs(wheelAccumX.current) > SCROLL_THRESHOLD) {
      const direction = wheelAccumX.current > 0 ? 1 : -1;
      const currentIndex = gazeModes.findIndex(m => m.key === gazeVisual);
      const newIndex = (currentIndex + direction + gazeModes.length) % gazeModes.length;
      setGazeVisual(gazeModes[newIndex].key);
      haptic.tap();
      wheelAccumX.current = 0;
      return;
    }

    // Vertical scroll - change quote
    scrollAccum.current += e.deltaY * settings.scrollSpeed;

    if (scrollAccum.current > SCROLL_THRESHOLD) {
      scrollAccum.current = 0;
      goToQuote(1);
    } else if (scrollAccum.current < -SCROLL_THRESHOLD) {
      scrollAccum.current = 0;
      goToQuote(-1);
    }
  }, [view, settings.scrollSpeed, goToQuote, gazeVisual, setGazeVisual]);

  const handleTouchStart = useCallback((e) => {
    if (view !== 'scroll') return;
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
    lastTouchY.current = e.touches[0].clientY;
    touchHistory.current = [{ y: e.touches[0].clientY, x: e.touches[0].clientX, time: Date.now() }];
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

  const handleTouchEnd = useCallback((e) => {
    if (view !== 'scroll' || isAnimating.current) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - touchStartX.current;
    const deltaY = touchStartY.current - endY;

    // Calculate velocity from recent touches
    const recent = touchHistory.current;
    let velocity = 0;
    if (recent.length >= 2) {
      const first = recent[0];
      const last = recent[recent.length - 1];
      const dt = last.time - first.time;
      if (dt > 0) velocity = (first.y - last.y) / dt;
    }

    // Check for horizontal swipe first (to change visual)
    const swipeThreshold = 80;
    if (Math.abs(deltaX) > swipeThreshold && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      // Horizontal swipe detected - change visual
      const direction = deltaX > 0 ? -1 : 1;
      const currentIndex = gazeModes.findIndex(m => m.key === gazeVisual);
      const newIndex = (currentIndex + direction + gazeModes.length) % gazeModes.length;
      setGazeVisual(gazeModes[newIndex].key);
      haptic.tap();
      setDisplayProgress(0);
      return;
    }

    // Vertical swipe - change quote
    const dominated = Math.abs(deltaY) > 50 || Math.abs(velocity) > 0.5;

    if (dominated && (deltaY > 30 || velocity > 0.3)) {
      goToQuote(1);
    } else if (dominated && (deltaY < -30 || velocity < -0.3)) {
      goToQuote(-1);
    } else {
      // Snap back
      setDisplayProgress(0);
    }
  }, [view, goToQuote, gazeVisual, setGazeVisual]);

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
          <div style={{ opacity: 0.4 }}>
            <GazeMode
              theme={currentTheme}
              primaryHue={settings.primaryHue}
              backgroundMode={true}
              currentVisual={gazeVisual}
            />
          </div>
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
          <nav style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {/* Main mode buttons - always visible */}
            {[
              { key: 'scroll', icon: '☰', label: 'Read' },
              { key: 'gaze', icon: '◯', label: 'Gaze' },
              { key: 'breathwork', icon: '◎', label: 'Breathe' },
              { key: 'drone', icon: '∿', label: 'Drone' },
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

            {/* DISABLED: Music button in nav - uncomment to re-enable */}
            {/* {musicTracks.length > 0 && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setMusicOpen(!musicOpen)}
                  style={{
                    background: musicOpen ? `hsla(${primaryHue}, 52%, 68%, 0.13)` : `${currentTheme.text}08`,
                    border: '1px solid',
                    borderColor: musicOpen ? `hsla(${primaryHue}, 52%, 68%, 0.27)` : currentTheme.border,
                    color: isPlaying ? primaryColor : currentTheme.textMuted,
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontFamily: '"Jost", sans-serif',
                    letterSpacing: '0.05em',
                    transition: 'all 0.5s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    minWidth: '2.5rem',
                    minHeight: '2.5rem',
                  }}
                >
                  <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>∿</span>
                  <span className="nav-label">Music</span>
                </button>

                {musicOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    background: 'rgba(0,0,0,0.95)',
                    border: `1px solid rgba(255,255,255,0.15)`,
                    borderRadius: '8px',
                    padding: '0.5rem',
                    zIndex: 150,
                    minWidth: '140px',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                  }}>
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
                        {currentTrack === i && isPlaying ? '· ' : ''}{track.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )} */}
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

                {/* HIDDEN FOR MINIMAL UI - Tags and save/filter buttons preserved for later
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
                END HIDDEN FOR MINIMAL UI */}
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
            background: breathSession.isActive ? 'transparent' : currentTheme.bg,
            transition: 'background 0.5s ease',
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
                {/* Ripples Visualization Background */}
                <GazeMode
                  theme={currentTheme}
                  primaryHue={settings.primaryHue}
                  backgroundMode={false}
                  currentVisual="ripples"
                />

                {/* Phase Label Overlay */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  zIndex: 10,
                  pointerEvents: 'none',
                }}>
                  <div style={{
                    fontSize: '1.8rem',
                    fontFamily: '"Jost", sans-serif',
                    color: currentTheme.text,
                    opacity: 0.85,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                  }}>
                    {breathTechniques[breathSession.technique]?.phases[breathSession.phaseIndex]?.label}
                  </div>
                </div>

                {/* Controls */}
                <div style={{
                  position: 'absolute',
                  bottom: '2rem',
                  display: 'flex',
                  gap: '1rem',
                  zIndex: 10,
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

            {/* Session Complete Screen */}
            {breathSession.isComplete && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                position: 'relative',
                padding: '2rem',
                textAlign: 'center',
              }}>
                {/* Soft glow background */}
                <div style={{
                  position: 'absolute',
                  width: '300px',
                  height: '300px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${currentTheme.accent}15 0%, transparent 70%)`,
                  animation: 'pulse 4s ease-in-out infinite',
                }} />

                <div style={{
                  fontSize: '0.7rem',
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  color: currentTheme.textMuted,
                  marginBottom: '1rem',
                }}>
                  Session Complete
                </div>

                <div style={{
                  fontSize: '1.1rem',
                  fontFamily: '"Jost", sans-serif',
                  color: currentTheme.text,
                  marginBottom: '0.5rem',
                  opacity: 0.9,
                }}>
                  {breathSession.cycleCount} breaths · {Math.floor(breathSession.sessionTime / 60)}:{String(breathSession.sessionTime % 60).padStart(2, '0')}
                </div>

                <div style={{
                  fontSize: '1rem',
                  fontFamily: '"Jost", sans-serif',
                  color: currentTheme.textMuted,
                  maxWidth: '280px',
                  lineHeight: 1.6,
                  marginTop: '2rem',
                  marginBottom: '3rem',
                }}>
                  Consider setting your phone aside and carrying this calm with you.
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  width: '100%',
                  maxWidth: '200px',
                }}>
                  <button
                    onClick={() => startBreathSession(breathSession.technique)}
                    style={{
                      background: currentTheme.cardBg,
                      border: `1px solid ${currentTheme.border}`,
                      color: currentTheme.text,
                      padding: '0.85rem 1.5rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontFamily: '"Jost", sans-serif',
                    }}
                  >
                    Breathe Again
                  </button>
                  <button
                    onClick={stopBreathSession}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: currentTheme.textMuted,
                      padding: '0.75rem 1.5rem',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontFamily: '"Jost", sans-serif',
                      opacity: 0.7,
                    }}
                  >
                    Done
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
            currentVisual={breathVisual}
            onVisualChange={setBreathVisual}
          />
        )}

        {/* Drone Mode - Generative ambient soundscape (always mounted to keep audio playing) */}
        <DroneMode
          primaryHue={primaryHue}
          primaryColor={primaryColor}
          backgroundMode={view !== 'drone'}
        />
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
                ? 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 50%, transparent 70%)'
                : `radial-gradient(circle, hsla(${primaryHue}, 52%, 68%, 0.15) 0%, hsla(${primaryHue}, 52%, 68%, 0.05) 50%, transparent 70%)`,
              border: `1.5px solid ${breathSession.phase === 'holdFull' || breathSession.phase === 'holdEmpty' ? 'rgba(255,255,255,0.35)' : `hsla(${primaryHue}, 52%, 68%, 0.3)`}`,
              transition: 'width 0.15s ease-out, height 0.15s ease-out, background 0.3s ease, border-color 0.3s ease',
            }} />

            {/* Phase label */}
            <div style={{
              marginTop: '2.5rem',
              color: breathSession.phase === 'holdFull' || breathSession.phase === 'holdEmpty' ? 'rgba(255,255,255,0.8)' : `hsla(${primaryHue}, 52%, 68%, 0.7)`,
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

        {/* DISABLED: Hidden audio elements for music crossfade - uncomment to re-enable */}
        {/* {musicTracks.length > 0 && (
          <>
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
          </>
        )} */}

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
          @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.1); opacity: 0.8; } }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.3); border-radius: 2px; }
          .nav-label { display: none; }
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

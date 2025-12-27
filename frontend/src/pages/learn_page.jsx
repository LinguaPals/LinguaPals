import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLearningLang } from '../services/userService.js';
import { getNextLearnItem, submitLearnAnswer } from '../services/learnService.js';
import { normalizeAnswerResponse, normalizeNextLearnItem } from '../adapters/learnAdapter.js';

function LearnPage() {
    const navigate = useNavigate();

    const [langCode, setLangCode] = useState(null);
    const [card, setCard] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [includeDetails, setIncludeDetails] = useState(true);
    const [lastAnswerResult, setLastAnswerResult] = useState(null);

    const [selectedChoiceIndex, setSelectedChoiceIndex] = useState(null);
    const [fitbInput, setFitbInput] = useState('');
    const [flashcardRevealed, setFlashcardRevealed] = useState(false);
    const [misspellOverride, setMisspellOverride] = useState(false);

    const [difficulty, setDifficulty] = useState('easy');

    const mode = 'model';
    const direction = 'nativeToTarget';
    const activityTypes = 'MC,FITB,Flashcard';

    const resetLocalActivityState = () => {
        setSelectedChoiceIndex(null);
        setFitbInput('');
        setFlashcardRevealed(false);
        setMisspellOverride(false);
    };

    const resolveLangCode = async () => {
        const cached = localStorage.getItem('learningLangCode');
        if (cached) return cached;

        try {
            const resolved = await getLearningLang();
            if (resolved?.langCode) return resolved.langCode;
        } catch (e) {
            // ignore and fall back
        }

        return 'es';
    };

    const fetchNext = async (effectiveLangCode, includeDetailsValue) => {
        setLoading(true);
        setError(null);
        setLastAnswerResult(null);

        try {
            const response = await getNextLearnItem({
                langCode: effectiveLangCode,
                mode,
                direction,
                difficulty,
                activityTypes,
                includeDetails: includeDetailsValue
            });

            const normalized = normalizeNextLearnItem(response);
            setCard(normalized);
            resetLocalActivityState();
        } catch (e) {
            setError(e?.message || 'Failed to fetch next learning item');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (result) => {
        if (loading) return;
        if (!langCode || !card || card.done) return;

        setLoading(true);
        setError(null);

        try {
            const response = await submitLearnAnswer({
                langCode,
                wordId: card.wordId,
                activityType: card.activityType,
                difficulty,
                result,
                misspellOverride
            });

            const normalized = normalizeAnswerResponse(response);
            setLastAnswerResult(normalized);

            await fetchNext(langCode, includeDetails);
        } catch (e) {
            setError(e?.message || 'Failed to submit answer');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let mounted = true;

        (async () => {
            const resolved = await resolveLangCode();
            if (!mounted) return;
            setLangCode(resolved);
            await fetchNext(resolved, true);
        })();

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        if (!langCode) return;
        fetchNext(langCode, includeDetails);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [difficulty]);

    const renderDetails = () => {
        if (!includeDetails || !card?.details) return null;
        const d = card.details;
        const examples = Array.isArray(d.examples) ? d.examples.slice(0, 2) : [];

        return (
            <div style={{ marginTop: '12px', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}>
                <div style={{ color: 'black', fontWeight: 600, marginBottom: '8px' }}>Details</div>
                {d.part_of_speech ? <div><strong>POS:</strong> {d.part_of_speech}</div> : null}
                {d.definition ? <div><strong>Definition:</strong> {d.definition}</div> : null}
                {d.definition_learner ? <div><strong>Definition (learner):</strong> {d.definition_learner}</div> : null}
                {examples.length > 0 ? (
                    <div style={{ marginTop: '8px' }}>
                        <strong>Examples:</strong>
                        <div style={{ marginTop: '4px' }}>
                            {examples.map((ex, idx) => (
                                <div key={idx} style={{ color: '#333' }}>{ex}</div>
                            ))}
                        </div>
                    </div>
                ) : null}
            </div>
        );
    };

    const renderCard = () => {
        if (!card) return null;

        if (card.done) {
            return (
                <div>
                    <p style={{ color: '#333' }}>No more items.</p>
                    <button className="match-button" onClick={() => navigate('/dashboard')}>
                        Back to Dashboard
                    </button>
                </div>
            );
        }

        if (card.activityType === 'MC') {
            return (
                <div>
                    <div style={{ color: 'black', fontSize: '18px', fontWeight: 600, marginBottom: '10px' }}>
                        {card.promptText}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                        {card.choices.map((c, idx) => (
                            <button
                                key={idx}
                                className="match-button"
                                disabled={loading}
                                onClick={() => {
                                    setSelectedChoiceIndex(idx);
                                    handleSubmit(c.isCorrect ? 'correct' : 'wrong');
                                }}
                                style={{
                                    textAlign: 'left',
                                    opacity: selectedChoiceIndex === idx ? 0.85 : 1,
                                    border: selectedChoiceIndex === idx ? '2px solid rgb(166,192,94)' : undefined
                                }}
                            >
                                {c.text}
                            </button>
                        ))}
                    </div>

                    {renderDetails()}
                </div>
            );
        }

        if (card.activityType === 'FITB') {
            return (
                <div>
                    <div style={{ color: 'black', fontSize: '18px', fontWeight: 600, marginBottom: '10px' }}>
                        {card.promptText}
                    </div>

                    <input
                        value={fitbInput}
                        onChange={(e) => setFitbInput(e.target.value)}
                        placeholder="Type your answer…"
                        disabled={loading}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                    />

                    <div style={{ marginTop: '10px' }}>
                        <label style={{ color: 'black' }}>
                            <input
                                type="checkbox"
                                checked={misspellOverride}
                                onChange={(e) => setMisspellOverride(e.target.checked)}
                                disabled={loading}
                                style={{ marginRight: '8px' }}
                            />
                            Misspell override
                        </label>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                        <button className="match-button" onClick={() => handleSubmit('correct')} disabled={loading}>
                            Submit Correct
                        </button>
                        <button className="unmatch-button" onClick={() => handleSubmit('wrong')} disabled={loading}>
                            Submit Wrong
                        </button>
                    </div>

                    {renderDetails()}
                </div>
            );
        }

        if (card.activityType === 'Flashcard') {
            return (
                <div>
                    <div style={{ color: 'black', fontSize: '18px', fontWeight: 600, marginBottom: '10px' }}>
                        {card.flashcard?.front}
                    </div>

                    {!flashcardRevealed ? (
                        <button className="match-button" onClick={() => setFlashcardRevealed(true)} disabled={loading}>
                            Reveal
                        </button>
                    ) : (
                        <div style={{ marginTop: '10px' }}>
                            <div style={{ color: '#333', marginBottom: '12px' }}>{card.flashcard?.back}</div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="match-button" onClick={() => handleSubmit('correct')} disabled={loading}>
                                    I knew it
                                </button>
                                <button className="unmatch-button" onClick={() => handleSubmit('wrong')} disabled={loading}>
                                    I didn’t
                                </button>
                            </div>
                        </div>
                    )}

                    {renderDetails()}
                </div>
            );
        }

        return (
            <div>
                <p style={{ color: '#333' }}>Unsupported activity type: {card.activityType}</p>
            </div>
        );
    };

    return (
        <div className="content">
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    <h1 style={{ color: 'black', marginTop: 0, marginBottom: 0 }}>Learn</h1>
                    <button className="unmatch-button" onClick={() => navigate('/dashboard')}>
                        Back
                    </button>
                </div>

                <div style={{ marginTop: '10px', color: '#333' }}>
                    <div><strong>Lang:</strong> {langCode || '...'}</div>
                    <div><strong>Mode:</strong> {mode} &nbsp; <strong>Direction:</strong> {direction} &nbsp; <strong>Difficulty:</strong> {difficulty}</div>
                </div>

                <div style={{ marginTop: '10px' }}>
                    <label style={{ color: 'black' }}>
                        Difficulty
                    </label>
                    <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        style={{ marginLeft: '10px', padding: '6px' }}
                    >
                        <option value="easy">easy</option>
                        <option value="medium">medium</option>
                        <option value="hard">hard</option>
                    </select>
                </div>

                <div style={{ marginTop: '10px' }}>
                    <label style={{ color: 'black' }}>
                        <input
                            type="checkbox"
                            checked={includeDetails}
                            onChange={(e) => {
                                const nextVal = e.target.checked;
                                setIncludeDetails(nextVal);
                                if (langCode) fetchNext(langCode, nextVal);
                            }}
                            style={{ marginRight: '8px' }}
                        />
                        Include details
                    </label>
                </div>

                {loading ? <p style={{ color: '#666' }}>Loading...</p> : null}
                {error ? <p style={{ color: '#ff4444' }}>{error}</p> : null}

                {lastAnswerResult?.word ? (
                    <div style={{ marginTop: '12px', padding: '10px', background: '#f7f7f7', borderRadius: '8px' }}>
                        <div style={{ color: 'black', fontWeight: 600 }}>Last result</div>
                        <div style={{ color: '#333' }}>
                            Score: {lastAnswerResult.word.score} &nbsp; Attempts: {lastAnswerResult.word.attempts} &nbsp; Correct: {lastAnswerResult.word.correct}
                        </div>
                    </div>
                ) : null}

                <div style={{ marginTop: '16px' }}>{renderCard()}</div>
            </div>
        </div>
    );
}

export default LearnPage;

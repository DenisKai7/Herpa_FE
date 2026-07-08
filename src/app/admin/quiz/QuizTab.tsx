'use client';

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, BookOpen, Layers, HelpCircle, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { QuizModule, QuizLevel, QuizQuestion } from '@/types/admin';
import { useQuizAdmin } from './useQuizAdmin';
import QuizDashboard from './QuizDashboard';
import ModuleTable from './ModuleTable';
import ModuleFormModal from './ModuleFormModal';
import LevelTable from './LevelTable';
import LevelFormModal from './LevelFormModal';
import QuestionTable from './QuestionTable';
import QuestionFormModal from './QuestionFormModal';

type SubTab = 'dashboard' | 'modules' | 'levels' | 'questions';

const subTabs: { id: SubTab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'modules', label: 'Modules', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'levels', label: 'Levels', icon: <Layers className="w-4 h-4" /> },
  { id: 'questions', label: 'Questions', icon: <HelpCircle className="w-4 h-4" /> },
];

const LIMIT = 20;

export default function QuizTab() {
  const {
    dashboard, modules, modulesTotal, levels, levelsTotal,
    questions, questionsTotal, loading, actionLoading,
    fetchDashboard, fetchModules, fetchLevels, fetchQuestions,
    createModule, updateModule, deleteModule,
    createLevel, updateLevel, deleteLevel,
    createQuestion, updateQuestion, deleteQuestion,
  } = useQuizAdmin();

  const [activeSubTab, setActiveSubTab] = useState<SubTab>('dashboard');
  const [moduleOffset, setModuleOffset] = useState(0);
  const [levelOffset, setLevelOffset] = useState(0);
  const [questionOffset, setQuestionOffset] = useState(0);
  const [moduleFormOpen, setModuleFormOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<QuizModule | null>(null);
  const [levelFormOpen, setLevelFormOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<QuizLevel | null>(null);
  const [questionFormOpen, setQuestionFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'module' | 'level' | 'question'; id: string } | null>(null);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);
  useEffect(() => { if (activeSubTab === 'modules') fetchModules({ limit: LIMIT, offset: moduleOffset }); }, [activeSubTab, moduleOffset, fetchModules]);
  useEffect(() => { if (activeSubTab === 'levels') fetchLevels({ limit: LIMIT, offset: levelOffset }); }, [activeSubTab, levelOffset, fetchLevels]);
  useEffect(() => { if (activeSubTab === 'questions') fetchQuestions({ limit: LIMIT, offset: questionOffset }); }, [activeSubTab, questionOffset, fetchQuestions]);

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === 'module') { await deleteModule(confirmDelete.id); fetchModules({ limit: LIMIT, offset: moduleOffset }); }
    else if (confirmDelete.type === 'level') { await deleteLevel(confirmDelete.id); fetchLevels({ limit: LIMIT, offset: levelOffset }); }
    else if (confirmDelete.type === 'question') { await deleteQuestion(confirmDelete.id); fetchQuestions({ limit: LIMIT, offset: questionOffset }); }
    fetchDashboard();
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {subTabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveSubTab(tab.id)} className={cn('flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer', activeSubTab === tab.id ? 'bg-purple-600 text-white shadow-sm' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800')}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === 'dashboard' && (loading || !dashboard ? <div className="flex items-center justify-center h-48"><Spinner size="lg" /></div> : <QuizDashboard stats={dashboard} />)}

      {activeSubTab === 'modules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-end"><Button variant="primary" size="sm" onClick={() => { setEditingModule(null); setModuleFormOpen(true); }} icon={<Plus className="h-3.5 w-3.5" />}>Add Module</Button></div>
          {loading ? <div className="flex items-center justify-center h-48"><Spinner size="lg" /></div> : <ModuleTable modules={modules} total={modulesTotal} limit={LIMIT} offset={moduleOffset} onPageChange={setModuleOffset} onCreate={() => { setEditingModule(null); setModuleFormOpen(true); }} onEdit={(m) => { setEditingModule(m); setModuleFormOpen(true); }} onDelete={(id) => setConfirmDelete({ type: 'module', id })} />}
        </div>
      )}

      {activeSubTab === 'levels' && (
        <div className="space-y-4">
          <div className="flex items-center justify-end"><Button variant="primary" size="sm" onClick={() => { setEditingLevel(null); setLevelFormOpen(true); }} icon={<Plus className="h-3.5 w-3.5" />}>Add Level</Button></div>
          {loading ? <div className="flex items-center justify-center h-48"><Spinner size="lg" /></div> : <LevelTable levels={levels} total={levelsTotal} limit={LIMIT} offset={levelOffset} onPageChange={setLevelOffset} onCreate={() => { setEditingLevel(null); setLevelFormOpen(true); }} onEdit={(l) => { setEditingLevel(l); setLevelFormOpen(true); }} onDelete={(id) => setConfirmDelete({ type: 'level', id })} />}
        </div>
      )}

      {activeSubTab === 'questions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-end"><Button variant="primary" size="sm" onClick={() => { setEditingQuestion(null); setQuestionFormOpen(true); }} icon={<Plus className="h-3.5 w-3.5" />}>Add Question</Button></div>
          {loading ? <div className="flex items-center justify-center h-48"><Spinner size="lg" /></div> : <QuestionTable questions={questions} total={questionsTotal} limit={LIMIT} offset={questionOffset} onPageChange={setQuestionOffset} onCreate={() => { setEditingQuestion(null); setQuestionFormOpen(true); }} onEdit={(q) => { setEditingQuestion(q); setQuestionFormOpen(true); }} onDelete={(id) => setConfirmDelete({ type: 'question', id })} />}
        </div>
      )}

      <ModuleFormModal isOpen={moduleFormOpen} onClose={() => { setModuleFormOpen(false); setEditingModule(null); }} onSubmit={async (data) => { if (editingModule) await updateModule(editingModule.id, data); else await createModule(data); fetchModules({ limit: LIMIT, offset: moduleOffset }); fetchDashboard(); return true; }} module={editingModule} />
      <LevelFormModal isOpen={levelFormOpen} onClose={() => { setLevelFormOpen(false); setEditingLevel(null); }} onSubmit={async (data) => { if (editingLevel) await updateLevel(editingLevel.id, data); else await createLevel(data); fetchLevels({ limit: LIMIT, offset: levelOffset }); fetchDashboard(); return true; }} level={editingLevel} modules={modules} />
      <QuestionFormModal isOpen={questionFormOpen} onClose={() => { setQuestionFormOpen(false); setEditingQuestion(null); }} onSubmit={async (data) => { if (editingQuestion) await updateQuestion(editingQuestion.id, data); else await createQuestion(data); fetchQuestions({ limit: LIMIT, offset: questionOffset }); fetchDashboard(); return true; }} question={editingQuestion} levels={levels} />
      <ConfirmDialog open={!!confirmDelete} title="Confirm Delete" message={confirmDelete ? `Delete this ${confirmDelete.type}?` : ''} variant="danger" confirmLabel="Delete" isLoading={actionLoading} onConfirm={handleConfirmDelete} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}

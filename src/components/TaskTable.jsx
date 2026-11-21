import { TASK_STATUSES, userName } from '../services/storage.js';

function isOverdue(task) {
  return task.status !== 'completed' && new Date(task.deadline + 'T23:59:59') < new Date();
}

/**
 * Shared task list used by the student "My Team" page and the faculty monitor.
 * canEdit(task) decides who may change the status, canDelete shows the delete button.
 */
export default function TaskTable({ tasks, canEdit, canDelete, onStatus, onDelete }) {
  if (tasks.length === 0) return <p className="muted">No tasks yet.</p>;
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Task</th>
            <th>Assigned to</th>
            <th>Deadline</th>
            <th>Status</th>
            {canDelete && <th></th>}
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t.id}>
              <td>{t.title}</td>
              <td>{userName(t.assigneeId)}</td>
              <td className={isOverdue(t) ? 'danger-text' : ''}>
                {t.deadline}
                {isOverdue(t) && ' (overdue)'}
              </td>
              <td>
                {canEdit && canEdit(t) ? (
                  <select value={t.status} onChange={(e) => onStatus(t.id, e.target.value)}>
                    {TASK_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <span className={`status status-${t.status.replace(' ', '-')}`}>{t.status}</span>
                )}
              </td>
              {canDelete && (
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => onDelete(t.id)}>Delete</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

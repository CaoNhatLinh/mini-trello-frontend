import React, { useMemo, useCallback, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useDrop } from "react-dnd";
import TaskCard from "../tasks/TaskCard";

function BoardColumn({
  card,
  getTasksForCard,
  onTaskClick,
  onAddTask,
  onEditCard,
  onDeleteCard,
  onEditTask,
  onDeleteTask,
  onTaskUpdate,
  boardId,
  onAttachmentUpdated,
  quickAddOpen,
  quickTaskTitle,
  onQuickTaskChange,
  onQuickTaskSubmit,
  onQuickTaskCancel,
  onTaskMove,
  boardMembers = [],
}) {
  const dropConfig = useMemo(
    () => ({
      accept: ["TASK", "CARD"],
      drop: (item, monitor) => {
        const cardId = card.id;

        if (item.type === "task") {
          const tasksInCard = getTasksForCard ? getTasksForCard(cardId) : [];
          const newPosition = tasksInCard.length; // Add at end by default

          return {
            cardId,
            type: "task-drop",
            position: newPosition,
          };
        } else if (item.type === "card") {
          return { cardId, type: "card-drop" };
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [card.id, getTasksForCard]
  );

  const [{ canDrop, isOver }, drop] = useDrop(dropConfig);

  if (!card) {
    return null;
  }

  const cardTasks = getTasksForCard ? getTasksForCard(card.id) : [];

  return (
    <Paper
      ref={drop}
      elevation={1}
      sx={{
        minWidth: 272,
        width: 272,
        bgcolor: "#0E0F05",
        borderRadius: 2,
        p: 1,
        height: "fit-content",
        backgroundColor: isOver ? "#1A1B1E" : "#0E0F05",
        transition: "background-color 0.2s ease",
        border: "1px solid #2D2E31",
      }}
    >
      <CardColumnHeader
        card={card}
        tasksCount={cardTasks.length}
        onEditCard={onEditCard}
        onDeleteCard={onDeleteCard}
      />

      {/* Task List */}
      <Box sx={{ minHeight: 4 }}>
        {cardTasks.map((task) => (
          <Box key={task.id} sx={{ mb: 1 }}>
            <TaskCard
              task={task}
              boardId={boardId}
              cardId={card.id}
              onClick={() => onTaskClick(task)}
              onEdit={() => onEditTask && onEditTask(task)}
              onDelete={() => onDeleteTask && onDeleteTask(task.id)}
              onTaskMove={onTaskMove}
              onTaskUpdate={onTaskUpdate}
              onAttachmentUpdated={onAttachmentUpdated}
              boardMembers={boardMembers}
            />
          </Box>
        ))}
      </Box>

      {/* Add Task Section */}
      {quickAddOpen ? (
        <Box sx={{ mt: 1 }}>
          <form onSubmit={onQuickTaskSubmit}>
            <TextField
              autoFocus
              fullWidth
              size="small"
              placeholder="Enter a title for this card..."
              value={quickTaskTitle}
              onChange={(e) => onQuickTaskChange(e.target.value)}
              sx={{
                mb: 1,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#2D2E31",
                  borderRadius: 1,
                  fontSize: "14px",
                  color: "#BDC1CA",
                  "& fieldset": {
                    borderColor: "#4A4B4F",
                  },
                  "&:hover fieldset": {
                    borderColor: "#6C7B7F",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#8E44AD",
                  },
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "#8E8E93",
                  opacity: 1,
                },
              }}
            />
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                type="submit"
                variant="contained"
                size="small"
                disabled={!quickTaskTitle.trim()}
                sx={{
                  backgroundColor: "#8E44AD",
                  fontSize: "14px",
                  textTransform: "none",
                  color: "#FFFFFF",
                  "&:hover": {
                    backgroundColor: "#7B3F98",
                  },
                  "&:disabled": {
                    backgroundColor: "#4A4B4F",
                    color: "#8E8E93",
                  },
                }}
              >
                Add card
              </Button>
              <Button
                size="small"
                onClick={onQuickTaskCancel}
                sx={{
                  color: "#BDC1CA",
                  fontSize: "14px",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#2D2E31",
                  },
                }}
              >
                Cancel
              </Button>
            </Box>
          </form>
        </Box>
      ) : (
        <Button
          fullWidth
          onClick={() => onAddTask(card.id)}
          sx={{
            mt: 1,
            color: "#BDC1CA",
            textTransform: "none",
            justifyContent: "flex-start",
            borderRadius: 2,
            py: 1,
            fontSize: "14px",
            "&:hover": {
              backgroundColor: "#2D2E31",
              color: "#FFFFFF",
            },
          }}
          startIcon={
            <Box
              sx={{
                width: 16,
                height: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
              }}
            >
              +
            </Box>
          }
        >
          Add a card
        </Button>
      )}
    </Paper>
  );
}

function BoardColumns({
  cards = [],
  getTasksForCard,
  onTaskClick,
  onAddTask,
  onAddList,
  onEditCard,
  onDeleteCard,
  onEditTask,
  onDeleteTask,
  onTaskUpdate,
  boardId,
  onAttachmentUpdated,
  quickAddOpen,
  quickTaskTitle,
  onQuickTaskChange,
  onQuickTaskSubmit,
  onQuickTaskCancel,
  onTaskMove,
  boardMembers = [],
}) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        overflowX: "auto",
        minHeight: "calc(100vh - 200px)",
        p: 2,
      }}
    >
      {cards.map((card, index) => (
        <BoardColumn
          key={card.id}
          card={card}
          getTasksForCard={getTasksForCard}
          onTaskClick={onTaskClick}
          onAddTask={onAddTask}
          onEditCard={onEditCard}
          onDeleteCard={onDeleteCard}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onTaskUpdate={onTaskUpdate}
          boardId={boardId}
          onAttachmentUpdated={onAttachmentUpdated}
          quickAddOpen={quickAddOpen === card.id}
          quickTaskTitle={quickTaskTitle}
          onQuickTaskChange={onQuickTaskChange}
          onQuickTaskSubmit={onQuickTaskSubmit}
          onQuickTaskCancel={onQuickTaskCancel}
          onTaskMove={onTaskMove}
          boardMembers={boardMembers}
        />
      ))}

      <Box sx={{ minWidth: 280 }}>
        <Paper
          sx={{
            p: 2,
            backgroundColor: "rgba(189,193,202,0.1)",
            color: "#505f83ff",
            cursor: "pointer",
            textAlign: "center",
            borderRadius: 2,
            border: "1px solid #2D2E31",
            "&:hover": {
              backgroundColor: "rgba(189,193,202,0.2)",
              borderColor: "#8E44AD",
            },
          }}
          onClick={onAddList}
        >
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            + Add another list
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}

function CardColumnHeader({ card, tasksCount, onEditCard, onDeleteCard }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    onEditCard && onEditCard(card);
  };

  const handleDelete = () => {
    handleMenuClose();
    onDeleteCard && onDeleteCard(card);
  };

  return (
    <Box
      sx={{
        p: 1,
        mb: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 600,
          color: "#BDC1CA",
          fontSize: "14px",
          flex: 1,
        }}
      >
        {card.name}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {/* Task Count */}
        <Typography
          variant="caption"
          sx={{
            color: "#BDC1CA",
            backgroundColor: "#2D2E31",
            borderRadius: "12px",
            px: 1,
            py: 0.5,
            fontSize: "11px",
            fontWeight: 500,
          }}
        >
          {tasksCount}
        </Typography>

        {/* 3-dot Menu */}
        <IconButton
          size="small"
          onClick={handleMenuClick}
          sx={{
            color: "#BDC1CA",
            width: 28,
            height: 28,
            borderRadius: 2,
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "#2D2E31",
              color: "#FFFFFF",
              transform: "scale(1.05)",
            },
          }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          PaperProps={{
            sx: {
              backgroundColor: "#0E0F05",
              border: "1px solid #2D2E31",
              borderRadius: 3,
              minWidth: 160,
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              backdropFilter: "blur(10px)",
              mt: 1,
            },
          }}
        >
          <MenuItem
            onClick={handleEdit}
            sx={{
              color: "#BDC1CA",
              fontSize: "0.875rem",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              py: 1.5,
              px: 2,
              "&:hover": {
                backgroundColor: "#2D2E31",
                color: "#FFFFFF",
              },
            }}
          >
            <EditIcon sx={{ fontSize: 18 }} />
            Edit
          </MenuItem>
          <MenuItem
            onClick={handleDelete}
            sx={{
              color: "#F87171",
              fontSize: "0.875rem",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              py: 1.5,
              px: 2,
              "&:hover": {
                backgroundColor: "#2D2E31",
                color: "#FF6B6B",
              },
            }}
          >
            <DeleteIcon sx={{ fontSize: 18 }} />
            Delete
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}

export default BoardColumns;

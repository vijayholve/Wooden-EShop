import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types"; // Import PropTypes

// Material UI
import {
  Grid,
  Button,
  Box,
  IconButton,
  TextField,
  InputAdornment,
  Typography,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/system";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import { DataGrid } from "@mui/x-data-grid";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  PersonAdd as PersonAddIcon,
} from "@mui/icons-material";

// Project Imports
import MainCard from "./cards/MainCard";
import SecondaryAction from "./cards/CardSecondaryAction";
import { useAuth } from "../context/AuthContext"; // CRITICAL: Import useAuth
import { toast } from "react-hot-toast"; // Assuming react-hot-toast is used

// --- Styled Components ---

const ActionWrapper = styled(Box)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "4px",
  padding: "4px",
});

const HeaderSearchWrapper = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "16px",
  flexWrap: "wrap",
  marginLeft: "auto",
  "@media (max-width: 600px)": {
    marginLeft: 0,
    marginTop: "16px",
    justifyContent: "space-between",
  },
});

// --- Mobile Card Component ---

const DataGridMobileCard = ({
  row,
  columns,
  onView,
  onEdit,
  onDelete,
  onEnroll,
  hasActions,
}) => {
  const getCellValue = (col) => {
    // mimic DataGrid valueGetter
    try {
      if (typeof col.valueGetter === "function") {
        return col.valueGetter({ row, value: row?.[col.field] });
      }
    } catch {
      /* ignore valueGetter errors */
    }
    const value = row?.[col.field];
    
    // Handle boolean display explicitly for better mobile view
    if (col.type === 'boolean' && typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    return value ?? "";
  };

  const displayColumns = columns.filter((c) => c.field !== "actions");

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        p: 1.5,
        mb: 1.5,
        bgcolor: "background.paper",
      }}
    >
      {displayColumns.map((col) => (
        <Box
          key={col.field}
          sx={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 1,
            py: 0.5,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ minWidth: 110 }}
          >
            {col.headerName || col.field}
          </Typography>
          <Typography variant="body2" sx={{ textAlign: "right", flex: 1 }}>
            {String(getCellValue(col) ?? "")}
          </Typography>
        </Box>
      ))}

      {hasActions && (
        <ActionWrapper sx={{ justifyContent: "flex-end", pt: 0.5 }}>
          {onView && (
            <Tooltip title="View">
              <IconButton size="small" color="info" onClick={onView}>
                <ViewIcon />
              </IconButton>
            </Tooltip>
          )}
          {onEnroll && (
            <Tooltip title="Enroll">
              <IconButton size="small" color="secondary" onClick={onEnroll}>
                <PersonAddIcon />
              </IconButton>
            </Tooltip>
          )}
          {onEdit && (
            <Tooltip title="Edit">
              <IconButton size="small" color="primary" onClick={onEdit}>
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title="Delete">
              <IconButton size="small" color="error" onClick={onDelete}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </ActionWrapper>
      )}
    </Box>
  );
};

DataGridMobileCard.propTypes = {
  row: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  onView: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onEnroll: PropTypes.func,
  hasActions: PropTypes.bool.isRequired,
};

// --- Main Component ---

const MOBILE_BREAKPOINT = 768;
const ReusableDataGrid = ({
  title,
  fetchUrl,
  columns: propColumns,
  editUrl,
  deleteUrl,
  addActionUrl,
  EnrollActionUrl,
  viewUrl,
  data: clientSideData = [],
  customActionsHeader = [],
  searchPlaceholder = "Search...",
  showSearch = true,
  showRefresh = true,
  pageSizeOptions = [5, 10, 25, 50],
  defaultPageSize = 10,
  height = 600,
  transformData = null,
  isPostRequest = false,
  requestMethod,
  reloadKey = 0,
  onRowClick = null,
  selectionModel = null,
  onSelectionModelChange = null,
  checkboxSelection = false,
  disableSelectionOnClick = false,
  getRowClassName = null,
  customToolbar = null,
  loadingOverlay = null,
  errorOverlay = null,
  customActions = [],
  getRowId: getRowIdProp = (row) => row.id,
  schoolNameMap = {},
  classNameMap = {},
  divisionNameMap = {},
  onDelete,
}) => {
  const navigate = useNavigate();
  const { apiFetch } = useAuth(); // CRITICAL: Access the authenticated fetch utility
  
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.innerWidth < MOBILE_BREAKPOINT
      : false
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0, // 0-based page
    pageSize: defaultPageSize,
  });

  const handlePaginationModelChange = useCallback((newModel) => {
    if (!newModel) return;
    setPaginationModel((prev) => {
      const newPage =
        typeof newModel.page === "number" ? newModel.page : prev.page;
      const newPageSize =
        typeof newModel.pageSize === "number"
          ? newModel.pageSize
          : prev.pageSize;
      if (newPage === prev.page && newPageSize === prev.pageSize) return prev;
      return { page: newPage, pageSize: newPageSize };
    });
  }, []);

  const [searchText, setSearchText] = useState("");
  const [gridData, setGridData] = useState([]);
  const [serverTotalCount, setServerTotalCount] = useState(0);

  // Client-side implementation 
  const recomputeData = useCallback(() => {
    const filteredData = clientSideData.filter((item) => {
      if (!searchText) return true;
      try {
        return JSON.stringify(item)
          .toLowerCase()
          .includes(searchText.toLowerCase());
      } catch {
        return false;
      }
    });
    const transformedData = transformData
      ? filteredData.map(transformData)
      : filteredData;
    setGridData(transformedData);
  }, [clientSideData, searchText, transformData]);

  // Server-side fetching logic
  useEffect(() => {
    // Only proceed if fetchUrl is provided and we have the authentication utility
    if (!fetchUrl || !apiFetch) return; 

    let cancelled = false;
    const controller = new AbortController();

    const doFetch = async () => {
      setLoading(true);
      try {
        const pageToSend = (paginationModel?.page ?? 0) + 1; // Server expects 1-based page
        const sizeToSend = paginationModel?.pageSize ?? defaultPageSize;

        const method =
          (typeof requestMethod === "string" && requestMethod.toUpperCase()) ||
          (isPostRequest ? "POST" : "GET");

        let res;
        
        // Prepare the payload or URLSearchParams
        let requestPayload = { page: pageToSend, size: sizeToSend };
        if (searchText) {
            // DRF filtering convention
            requestPayload.search = searchText; 
        }

        if (method === "GET") {
          const params = new URLSearchParams(requestPayload);
          console.log("Fetch URL with params:", fetchUrl, params.toString());
          // const url = fetchUrl.includes("?")
          //   ? `${fetchUrl}&${params}`
          //   : `${fetchUrl}?${params}`;
            
          res = await apiFetch(fetchUrl, { 
            method: "GET", 
            signal: controller.signal,
            rawResponse: true // Instruct apiFetch to return the raw Response object
          });
          
        } else if (method === "POST") {
          res = await apiFetch(fetchUrl, {
            method: "POST",
            body: requestPayload, // apiFetch handles JSON.stringify(body)
            signal: controller.signal,
            rawResponse: true
          });
        } else {
            // Handle other methods (PUT/PATCH/DELETE)
            console.warn(`Unsupported request method ${method} for list fetching.`);
            res = { ok: false, status: 405, text: async () => `Method ${method} not allowed.` };
        }

        if (cancelled) return;

        if (!res.ok) {
          const errorDetail = await res.text();
          console.error("Server returned error for fetchUrl", res.status, errorDetail);
          toast.error(`Failed to load data (Status: ${res.status}). Check API endpoint and authentication.`);
          setGridData([]);
          setServerTotalCount(0);
          return;
        }

        const json = await res.json();

        // Handle various response formats (DRF pagination, simple array, custom paginated)
        let newGridData = [];
        let newTotalCount = 0;

        if (Array.isArray(json)) {
          newGridData = json;
          newTotalCount = json.length;
        } else if (json.results && Array.isArray(json.results)) { // DRF style pagination
          newGridData = json.results;
          newTotalCount = typeof json.count === "number" ? json.count : json.results.length;
        } else if (json.data && Array.isArray(json.data)) { // Custom style pagination
          newGridData = json.data;
          newTotalCount = typeof json.total === "number" ? json.total : json.data.length;
        } else {
          console.warn("Unexpected API response structure:", json);
        }
        
        const finalData = transformData ? newGridData.map(transformData) : newGridData;
        setGridData(finalData);
        setServerTotalCount(newTotalCount);

      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Failed to fetch data for ReusableDataGrid", err);
        toast.error("Network or Authentication error occurred.");
        setGridData([]);
        setServerTotalCount(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    
    // Only fetch if a URL is provided (server-side grid)
    if (fetchUrl) {
      doFetch();
    } else {
        // For client-side data (simple mode), run recompute on state change
        recomputeData();
        setServerTotalCount(clientSideData.length);
    }
    
    return () => {
      cancelled = true;
      controller.abort();
    };
    
  }, [
    fetchUrl,
    apiFetch, // CRITICAL DEPENDENCY ADDED
    paginationModel.page,
    paginationModel.pageSize,
    searchText,
    requestMethod,
    isPostRequest,
    transformData,
    defaultPageSize,
    reloadKey,
    // clientSideData, //looping
    // recomputeData //looping
  ]);

  const handleOnClickDelete = React.useCallback(
    async (id) => {
      // NOTE: This uses the onDelete prop which should be implemented in the parent (e.g., products/index.jsx)
      if (!onDelete) return;
      // Using window.confirm is acceptable here, but usually replaced by a MUI Dialog in production apps
      if (window.confirm("Are you sure you want to delete this item?")) {
        try {
          await onDelete(id);
          toast.success("Item deleted successfully!");
          // Trigger data reload for server-side or recompute for client-side
          if (fetchUrl) {
              setReloadKey((k) => k + 1);
          } else {
              // Note: client-side delete relies on parent re-passing new data
              recomputeData();
          }
        } catch (err) {
          console.error(err);
          toast.error("Failed to delete item.");
        }
      }
    },
    [onDelete, fetchUrl] 
  );

  const handleOnClickView = React.useCallback(
    (id) => {
      navigate(`${viewUrl}/${id}`);
    },
    [navigate, viewUrl]
  );
  
  const handleOnClickEnrollActionUrl = React.useCallback(
    (id) => {
      navigate(`${EnrollActionUrl}/${id}`);
    },
    [navigate, EnrollActionUrl]
  );
  
  const handleSearch = (event) => {
    const newSearchText = event.target.value;
    setSearchText(newSearchText);
    // When searching on server-side, reset to page 1
    if (fetchUrl) {
        setPaginationModel((p) => ({ ...p, page: 0 }));
    }
  };

  const handleRefresh = () => {
    setSearchText("");
    setPaginationModel({ page: 0, pageSize: defaultPageSize });
    // Force refetch by incrementing reload key
    setReloadKey((k) => k + 1); 
  };

  const handleRowClick = (params) => {
    if (onRowClick) {
      onRowClick(params);
    }
  };
  
  const hasActions =
    editUrl ||
    deleteUrl ||
    viewUrl ||
    EnrollActionUrl ||
    customActions.length > 0;

  // helper to map id to name if maps are provided
  const getNameForId = (id, map) => (map && map[id] ? map[id] : id);

  // Process columns with value formatters for IDs
  const processedColumns = React.useMemo(() => {
    return propColumns.map((col) => {
      // Logic for transforming IDs into names for display
      if (col.field === "schoolId" && Object.keys(schoolNameMap).length > 0) {
        return {
          ...col,
          headerName: col.headerName || "School",
          valueFormatter: (params) => getNameForId(params.value, schoolNameMap),
        };
      }
      if (col.field === "classId" && Object.keys(classNameMap).length > 0) {
        return {
          ...col,
          headerName: col.headerName || "Class",
          valueFormatter: (params) => getNameForId(params.value, classNameMap),
        };
      }
      if (col.field === "divisionId" && Object.keys(divisionNameMap).length > 0) {
        return {
          ...col,
          headerName: col.headerName || "Division",
          valueFormatter: (params) =>
            getNameForId(params.value, divisionNameMap),
        };
      }

      return col;
    });
  }, [propColumns, schoolNameMap, classNameMap, divisionNameMap]);

  // Memoize columns including the action column
  const columns = React.useMemo(() => {
    if (!hasActions) return processedColumns;

    const actionCol = {
      field: "actions",
      headerName: "Actions",
      width: 160,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        // Use row.slug if provided for unique identification/navigation, otherwise fall back to row.id
        const rowId = getRowIdProp(params.row);
        
        // Render custom actions first
        if (customActions.length > 0) {
          return (
            <ActionWrapper>
              {customActions.map((action, index) => (
                <Tooltip key={index} title={action.tooltip || action.label}>
                  <IconButton
                    size="small"
                    color={action.color || "primary"}
                    onClick={() => action.onClick(params.row)}
                    // Added a simple transition for better UX
                    sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.1)' } }}
                  >
                    {action.icon}
                  </IconButton>
                </Tooltip>
              ))}
            </ActionWrapper>
          );
        }

        // Render standard actions
        return (
          <ActionWrapper>
            {viewUrl && (
              <Tooltip title="View Details">
                <IconButton
                  size="small"
                  color="info"
                  onClick={() => handleOnClickView(rowId)}
                  sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.1)' } }}
                >
                  <ViewIcon />
                </IconButton>
              </Tooltip>
            )}
            {EnrollActionUrl && (
              <Tooltip title="Enroll">
                <IconButton
                  size="small"
                  color="secondary"
                  onClick={() => handleOnClickEnrollActionUrl(rowId)}
                  sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.1)' } }}
                >
                  <PersonAddIcon />
                </IconButton>
              </Tooltip>
            )}
            {editUrl && (
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => navigate(`${editUrl}/${rowId}`)}
                  sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.1)' } }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )}
            {/* Delete relies on onDelete prop being passed */}
            {onDelete && (
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleOnClickDelete(rowId)}
                  sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.1)' } }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
          </ActionWrapper>
        );
      },
    };

    return [...processedColumns, actionCol];
  }, [
    processedColumns,
    hasActions,
    customActions,
    viewUrl,
    EnrollActionUrl,
    editUrl,
    onDelete, 
    navigate,
    handleOnClickDelete,
    handleOnClickEnrollActionUrl,
    handleOnClickView,
    getRowIdProp,
  ]);
  
  // Secondary header content placeholder
  const secondaryHeader = (
    <Grid
      container
      spacing={2}
      alignItems="center"
      padding={2}
      justifyContent="flex-end"
    >
      {customActionsHeader && <Grid item>{customActionsHeader}</Grid>}
    </Grid>
  );

  // Search and Refresh controls for the card header
  const headerSearchControls = (
    <HeaderSearchWrapper>
      {showSearch && (
        <TextField
          size="small"
          placeholder={searchPlaceholder}
          value={searchText}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 250 }}
        />
      )}
      {showRefresh && (
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading}
        >
          Refresh
        </Button>
      )}
      {/* Add action button with link */}
      {addActionUrl && (
        <SecondaryAction icon={<AddIcon />} link={addActionUrl} />
      )}
    </HeaderSearchWrapper>
  );

  // Render the component
  return (
    <MainCard
      title={
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            flexWrap: "wrap",
          }}
        >
          <Typography variant="h3" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          {headerSearchControls}
        </Box>
      }
      secondary={secondaryHeader}
      contentSX={{ p: 1 }}
    >
      {customToolbar && customToolbar()}

      <Grid container>
        <Grid item xs={12}>
          {isMobile ? (
            // Mobile: card list view
            <Box>
              {loading ? (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography>Loading...</Typography>
                </Box>
              ) : gridData.length === 0 ? (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography color="text.secondary">No data found.</Typography>
                </Box>
              ) : (
                gridData.map((row) => {
                  const rowId = getRowIdProp(row);
                  return (
                    <DataGridMobileCard
                      key={rowId}
                      row={row}
                      columns={columns}
                      hasActions={hasActions}
                      onView={viewUrl ? () => handleOnClickView(rowId) : undefined}
                      onEdit={
                        editUrl ? () => navigate(`${editUrl}/${rowId}`) : undefined
                      }
                      onDelete={
                        onDelete ? () => handleOnClickDelete(rowId) : undefined
                      }
                      onEnroll={
                        EnrollActionUrl
                          ? () => handleOnClickEnrollActionUrl(rowId)
                          : undefined
                      }
                    />
                  );
                })
              )}

              {/* Simple manual pager for mobile */}
              {fetchUrl && (
                <Box
                  sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}
                >
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={paginationModel.page === 0 || loading}
                    onClick={() =>
                      setPaginationModel((p) => ({
                        ...p,
                        page: Math.max(0, p.page - 1),
                      }))
                    }
                  >
                    Prev
                  </Button>
                  <Typography variant="caption">
                    Page {paginationModel.page + 1}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    // Assume next page available if not the last page based on server total count
                    disabled={loading || (paginationModel.page + 1) * paginationModel.pageSize >= serverTotalCount}
                    onClick={() =>
                      setPaginationModel((p) => ({ ...p, page: p.page + 1 }))
                    }
                  >
                    Next
                  </Button>
                </Box>
              )}
            </Box>
          ) : (
            // Desktop: DataGrid table
            <Box sx={{ height, width: "100%" }}>
              <DataGrid
                rows={gridData}
                columns={columns}
                loading={loading}
                {...(fetchUrl ? { rowCount: serverTotalCount } : {})}
                pageSizeOptions={pageSizeOptions}
                paginationModel={paginationModel}
                onPaginationModelChange={handlePaginationModelChange}
                // Use 'server' mode only if a fetchUrl is provided, otherwise client
                paginationMode={fetchUrl ? "server" : "client"}
                getRowId={getRowIdProp}
                onRowClick={onRowClick || handleRowClick}
                selectionModel={selectionModel}
                onSelectionModelChange={onSelectionModelChange}
                checkboxSelection={checkboxSelection}
                disableSelectionOnClick={disableSelectionOnClick}
                getRowClassName={getRowClassName}
                loadingOverlay={loadingOverlay}
                errorOverlay={errorOverlay}
                sx={{
                  // Added styling for better visual feedback
                  "& .MuiDataGrid-row:hover": {
                    backgroundColor: "rgba(25, 118, 210, 0.04)",
                    cursor: onRowClick ? "pointer" : "default",
                  },
                  "& .MuiDataGrid-row.Mui-selected": {
                    backgroundColor: "rgba(25, 118, 210, 0.08)",
                  },
                  "& .MuiDataGrid-row.Mui-selected:hover": {
                    backgroundColor: "rgba(25, 118, 210, 0.12)",
                  },
                }}
              />
            </Box>
          )}
        </Grid>
      </Grid>
    </MainCard>
  );
};

// --- PropTypes Definition ---

ReusableDataGrid.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  title: PropTypes.string,
  fetchUrl: PropTypes.string,
  editUrl: PropTypes.string,
  deleteUrl: PropTypes.string, // Note: deleteUrl is unused, onDelete callback is used
  addActionUrl: PropTypes.string,
  EnrollActionUrl: PropTypes.string,
  viewUrl: PropTypes.string,
  data: PropTypes.array, // Data for client-side grid only
  isPostRequest: PropTypes.bool,
  requestMethod: PropTypes.string,
  customActionsHeader: PropTypes.node,
  searchPlaceholder: PropTypes.string,
  showSearch: PropTypes.bool,
  showRefresh: PropTypes.bool,
  pageSizeOptions: PropTypes.array,
  defaultPageSize: PropTypes.number,
  height: PropTypes.number,
  transformData: PropTypes.func,
  reloadKey: PropTypes.number, // External key to force data reload
  onRowClick: PropTypes.func,
  selectionModel: PropTypes.any,
  onSelectionModelChange: PropTypes.func,
  checkboxSelection: PropTypes.bool,
  disableSelectionOnClick: PropTypes.bool,
  getRowClassName: PropTypes.func,
  customToolbar: PropTypes.func,
  loadingOverlay: PropTypes.node,
  errorOverlay: PropTypes.node,
  customActions: PropTypes.array,
  getRowId: PropTypes.func,
  schoolNameMap: PropTypes.object,
  classNameMap: PropTypes.object,
  divisionNameMap: PropTypes.object,
  onDelete: PropTypes.func, // Callback for delete action
};

export default ReusableDataGrid;

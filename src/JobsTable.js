import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import FullScreenDialog from './JobDialogue';

// graphql/apollo
import ApolloClient from "apollo-boost";
import gql from "graphql-tag";
import { Query } from "react-apollo";
import { ApolloProvider } from "react-apollo";

// fetch createdata
const client = new ApolloClient({
  uri: "https://etmdb.com/graphql"
});

const getJobs = gql`
  {
    allJobs {
      edges {
        node {
          id
          jobTitle
          genderMf      
          company {
            id
            companyName
          }
        }    
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

const JobRows = (props) => (
  <Query query={getJobs} >
    {({ loading, error, data }) => {      
      if (loading) return (
        <TableRow>          
          <TableCell>Loading...</TableCell>          
        </TableRow>
        );
      if (error) return (
        <TableRow>          
          <TableCell>Error</TableCell>          
        </TableRow>
        );
      
      return data.allJobs.edges.map(row => (
        <TableRow key={row.node.id} onClick={props.onJobClick.bind(this, row.node.id)}>
          <TableCell component="th" scope="row">
            {row.node.jobTitle}
          </TableCell>
          <TableCell>{row.node.company.companyName}</TableCell>          
        </TableRow>
      ));
    }}
  </Query>
);

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  table: {
    minWidth: 700,
  },
});

class SimpleTable extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      jobSelected : null,
      open:false
    };

    // This binding is necessary to make `this` work in the callback
    this.onJobClick = this.onJobClick.bind(this);
  }  

  onJobClick (id) {
    this.setState({jobSelected: id});
    this.handleClickOpen();
  }  

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
    const { classes } = this.props;

    return (
      <Paper className={classes.root}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Company</TableCell>              
            </TableRow>
          </TableHead>
          <TableBody>
            <ApolloProvider client={client}>
              <JobRows onJobClick={this.onJobClick}/>
            </ApolloProvider>
          </TableBody>
        </Table>
        <FullScreenDialog 
          jobSelected={this.state.jobSelected} 
          stateDialougeOpen={this.state.open} 
          handleClickOpen={this.handleClickOpen} 
          handleClose={this.handleClose} />
      </Paper>
    );
  }
}

SimpleTable.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SimpleTable);